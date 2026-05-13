"""
merge_landmarks.py
------------------
Menggabungkan dataset lama (JSON) dengan dataset baru (CSV) ke dalam
satu folder CSV per sistem, siap untuk training.

Cara pakai:
    python merge_landmarks.py

Output:
    public/landmarks/sibi/     -> A.csv, B.csv, ... (merged)
    public/landmarks/asl/      -> A.csv, B.csv, ...
    public/landmarks/bisindo/  -> A.csv, B.csv, ...
"""

import json
import csv
import os
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent / "public" / "landmarks"

JSON_FILES = {
    "sibi":    BASE_DIR / "sibi_landmarks.json",
    "asl":     BASE_DIR / "asl_landmarks.json",
    "bisindo": BASE_DIR / "bisindo_landmarks.json",
}

# BISINDO punya file dual-hand terpisah
BISINDO_2HAND = BASE_DIR / "bisindo_landmarks_2hand.json"

# Huruf yang di-skip (dynamic gesture)
SKIP_LETTERS = {"J", "Z"}

# ── Helpers ───────────────────────────────────────────────────────────────────

def make_header(feature_size: int) -> list[str]:
    """Buat header CSV: label, handedness, timestamp, x0, y0, ..."""
    coords = [f"{axis}{i}" for i in range(feature_size // 2) for axis in ("x", "y")]
    return ["label", "handedness", "timestamp"] + coords


def count_csv_rows(csv_path: Path) -> int:
    if not csv_path.exists():
        return 0
    with open(csv_path, "r") as f:
        return max(0, sum(1 for _ in f) - 1)  # minus header


def append_json_to_csv(
    json_path: Path,
    output_dir: Path,
    system: str,
    handedness: str = "Right",
    feature_size: int = 42,
):
    """
    Baca JSON {label: [[vector], [vector], ...]}, append ke CSV.
    Hanya menulis baris yang BELUM ada (cek berdasarkan timestamp=0 untuk data lama).
    """
    if not json_path.exists():
        print(f"  [SKIP] {json_path.name} tidak ditemukan")
        return

    with open(json_path, "r") as f:
        data: dict = json.load(f)

    output_dir.mkdir(parents=True, exist_ok=True)
    header = make_header(feature_size)

    total_written = 0

    for letter, samples in data.items():
        letter = letter.upper()
        if letter in SKIP_LETTERS:
            continue
        if not isinstance(samples, list) or len(samples) == 0:
            continue

        csv_path = output_dir / f"{letter}.csv"
        file_exists = csv_path.exists()

        # Baca existing timestamps untuk dedup
        existing_ts = set()
        if file_exists:
            with open(csv_path, "r") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    existing_ts.add(row.get("timestamp", ""))

        written = 0
        with open(csv_path, "a", newline="") as f:
            writer = csv.writer(f)

            # Tulis header jika file baru
            if not file_exists:
                writer.writerow(header)

            for i, vector in enumerate(samples):
                if not isinstance(vector, list):
                    continue
                if len(vector) != feature_size:
                    print(f"  [WARN] {letter} sample {i}: expected {feature_size} values, got {len(vector)} — skipped")
                    continue

                # Timestamp unik untuk data lama: "legacy_{system}_{letter}_{i}"
                ts = f"legacy_{system}_{letter}_{i}"
                if ts in existing_ts:
                    continue  # sudah ada, skip

                row = [letter, handedness, ts] + [f"{v:.6f}" for v in vector]
                writer.writerow(row)
                written += 1

        if written > 0:
            print(f"  {letter}: +{written} samples dari JSON lama")
        total_written += written

    print(f"  Total: {total_written} samples ditambahkan dari {json_path.name}")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("MotionWords — Landmark Merger")
    print("=" * 60)

    # ── SIBI ──────────────────────────────────────────────────────
    print("\n[SIBI]")
    append_json_to_csv(
        json_path=JSON_FILES["sibi"],
        output_dir=BASE_DIR / "sibi",
        system="sibi",
        handedness="Right",
        feature_size=42,
    )

    # ── ASL ───────────────────────────────────────────────────────
    print("\n[ASL]")
    append_json_to_csv(
        json_path=JSON_FILES["asl"],
        output_dir=BASE_DIR / "asl",
        system="asl",
        handedness="Right",
        feature_size=42,
    )

    # ── BISINDO (single-hand) ─────────────────────────────────────
    print("\n[BISINDO - single hand]")
    append_json_to_csv(
        json_path=JSON_FILES["bisindo"],
        output_dir=BASE_DIR / "bisindo",
        system="bisindo",
        handedness="Right",
        feature_size=42,
    )

    # ── BISINDO (dual-hand) ───────────────────────────────────────
    if BISINDO_2HAND.exists():
        print("\n[BISINDO - dual hand]")
        append_json_to_csv(
            json_path=BISINDO_2HAND,
            output_dir=BASE_DIR / "bisindo",
            system="bisindo_2hand",
            handedness="Right",
            feature_size=84,
        )

    # ── Summary ───────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("Summary:")
    for system in ["sibi", "asl", "bisindo"]:
        system_dir = BASE_DIR / system
        if not system_dir.exists():
            continue
        csv_files = list(system_dir.glob("*.csv"))
        total = sum(count_csv_rows(f) for f in csv_files)
        print(f"  {system.upper()}: {len(csv_files)} huruf, {total} total samples")

    print("\nSelesai! Data siap untuk training.")
    print(f"Output: {BASE_DIR}")


if __name__ == "__main__":
    main()
