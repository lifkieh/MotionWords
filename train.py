"""
train.py - MotionWords Training Script
Cara pakai:
    python train.py --system sibi
    python train.py --system asl
    python train.py --system bisindo
    python train.py --system all
"""

import argparse
import json
import re
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import tensorflow as tf
from tensorflow import keras

BASE_DIR     = Path(__file__).parent
LANDMARK_DIR = BASE_DIR / "public" / "landmarks"
MODEL_DIR    = BASE_DIR / "public" / "models"

FEATURE_SIZE = {"sibi": 42, "asl": 42, "bisindo": 84}
SKIP_LETTERS = {"J", "Z"}


def load_dataset(system):
    system_dir = LANDMARK_DIR / system
    if not system_dir.exists():
        raise FileNotFoundError(f"Dataset tidak ditemukan: {system_dir}")

    csv_files = sorted(system_dir.glob("*.csv"))
    if not csv_files:
        raise FileNotFoundError(f"Tidak ada CSV di {system_dir}")

    dfs = []
    feature_size = FEATURE_SIZE[system]

    for csv_path in csv_files:
        letter = csv_path.stem.upper()
        if letter in SKIP_LETTERS:
            continue
        try:
            df = pd.read_csv(csv_path, on_bad_lines='skip')
        except Exception as e:
            print(f"  [WARN] Skip {csv_path.name}: {e}")
            continue

        feature_cols = [c for c in df.columns if c.startswith(("x", "y")) and c[1:].isdigit()]
        if len(feature_cols) != feature_size:
            print(f"  [WARN] {csv_path.name}: expected {feature_size}, got {len(feature_cols)} — skip")
            continue

        X = df[feature_cols].values
        mask = ~np.isnan(X).any(axis=1)
        X = X[mask]
        if len(X) == 0:
            continue

        dfs.append((X, np.array([letter] * len(X))))
        print(f"  {letter}: {len(X)} samples")

    if not dfs:
        raise ValueError("Tidak ada data valid!")

    X_all = np.vstack([d[0] for d in dfs])
    y_all = np.concatenate([d[1] for d in dfs])

    le = LabelEncoder()
    y_encoded = le.fit_transform(y_all)
    label_names = [str(l) for l in le.classes_]

    print(f"\nTotal: {len(X_all)} samples, {len(label_names)} huruf")
    print(f"Huruf: {label_names}")
    return X_all.astype(np.float32), y_encoded, label_names


def build_model(feature_size, num_classes):
    model = keras.Sequential([
        keras.layers.Input(shape=(feature_size,), name="dense_input"),
        keras.layers.Dense(128, activation="relu"),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(64, activation="relu"),
        keras.layers.Dropout(0.2),
        keras.layers.Dense(num_classes, activation="softmax"),
    ], name="sequential_1")
    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def patch_model_json(model_json_path: Path):
    """
    Fix model.json agar kompatibel dengan TF.js di browser:
    1. Ganti 'batch_shape' -> 'batch_input_shape'
    2. Hapus prefix 'sequential_1/' dari nama weight
    """
    content = model_json_path.read_text(encoding="utf-8")

    # Fix InputLayer config
    content = content.replace('"batch_shape":', '"batch_input_shape":')

    # Fix weight names — hapus prefix sequential_1/
    content = re.sub(r'"sequential_1/(dense[^"]*)"', r'"\1"', content)

    model_json_path.write_text(content, encoding="utf-8")
    print(f"  Patched: model.json (TF.js compatible)")


def train(system):
    print(f"\n{'='*60}\nTraining: {system.upper()}\n{'='*60}\n")

    print("[1/4] Loading dataset...")
    X, y, label_names = load_dataset(system)
    feature_size = FEATURE_SIZE[system]
    num_classes = len(label_names)

    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )
    print(f"\nTrain: {len(X_train)}, Val: {len(X_val)}")

    print("\n[2/4] Building model...")
    model = build_model(feature_size, num_classes)
    model.summary()

    print("\n[3/4] Training...")
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_accuracy", patience=15,
            restore_best_weights=True, verbose=1
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=0.5, patience=7, verbose=1
        ),
    ]
    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=150, batch_size=32,
        callbacks=callbacks, verbose=1,
    )

    val_loss, val_acc = model.evaluate(X_val, y_val, verbose=0)
    print(f"\nVal accuracy: {val_acc:.4f} ({val_acc*100:.1f}%)")

    print("\n[4/4] Exporting...")
    output_dir = MODEL_DIR / system
    output_dir.mkdir(parents=True, exist_ok=True)

    # Export ke TF.js
    try:
        import tensorflowjs as tfjs
        tfjs.converters.save_keras_model(model, str(output_dir))
        print(f"  Exported to TF.js format")
    except Exception as e:
        print(f"  [WARN] TF.js export gagal: {e}")
        h5_path = output_dir / "model.h5"
        model.save(str(h5_path))
        print(f"  Saved as model.h5")

    # Patch model.json supaya kompatibel dengan browser
    model_json = output_dir / "model.json"
    if model_json.exists():
        patch_model_json(model_json)
    else:
        print(f"  [WARN] model.json tidak ditemukan, skip patch")

    # Tulis metadata.json
    metadata = {
        "labelMap": label_names,
        "featureSize": feature_size,
        "numClasses": num_classes,
        "finalAcc": float(val_acc),
    }
    with open(output_dir / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"  Written: metadata.json")

    print(f"\n{'='*60}")
    print(f"{system.upper()} selesai! Accuracy: {val_acc*100:.1f}%")
    print(f"Output: {output_dir}")
    print(f"{'='*60}\n")
    return val_acc


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--system",
        choices=["sibi", "asl", "bisindo", "all"],
        default="sibi"
    )
    args = parser.parse_args()

    systems = ["sibi", "asl", "bisindo"] if args.system == "all" else [args.system]
    results = {}
    for sys in systems:
        try:
            results[sys] = train(sys)
        except Exception as e:
            print(f"\n{sys} gagal: {e}")
            results[sys] = None

    if len(systems) > 1:
        print("\nSUMMARY:")
        for sys, acc in results.items():
            print(f"  {sys.upper()}: {f'{acc*100:.1f}%' if acc else 'GAGAL'}")