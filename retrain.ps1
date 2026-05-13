# MotionWords — Training Pipeline
# Cara pakai:
#   Klik kanan -> Run with PowerShell
#   ATAU di terminal: .\retrain.ps1
#   ATAU dengan parameter: .\retrain.ps1 -System sibi

param(
    [ValidateSet("sibi", "asl", "bisindo", "all")]
    [string]$System = ""
)

# ── Setup PATH ────────────────────────────────────────────────────────────────
$env:PATH = "E:\Anaconda;E:\Anaconda\Scripts;E:\Anaconda\condabin;" + $env:PATH
$PYTHON  = "E:\Anaconda\envs\mw\python.exe"
$PROJECT = "E:\Project abal abal\motionwords"

Set-Location $PROJECT

# ── Cek Python environment ────────────────────────────────────────────────────
if (-not (Test-Path $PYTHON)) {
    Write-Host ""
    Write-Host "ERROR: Python environment tidak ditemukan di $PYTHON" -ForegroundColor Red
    Write-Host "Jalankan setup environment dulu:" -ForegroundColor Yellow
    Write-Host "  E:\Anaconda\envs\mw\Scripts\pip.exe install tensorflow tensorflowjs scikit-learn numpy pandas" -ForegroundColor Cyan
    Read-Host "Tekan Enter untuk keluar"
    exit 1
}

# ── Pilih sistem jika tidak ada parameter ─────────────────────────────────────
if ($System -eq "") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   MotionWords — Training Pipeline" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pilih sistem yang akan ditraining:" -ForegroundColor Yellow
    Write-Host "  [1] SIBI"
    Write-Host "  [2] ASL"
    Write-Host "  [3] BISINDO"
    Write-Host "  [4] Semua (SIBI + ASL + BISINDO)"
    Write-Host ""
    $choice = Read-Host "Pilihan (1-4)"

    switch ($choice) {
        "1" { $System = "sibi" }
        "2" { $System = "asl" }
        "3" { $System = "bisindo" }
        "4" { $System = "all" }
        default {
            Write-Host "Pilihan tidak valid." -ForegroundColor Red
            Read-Host "Tekan Enter untuk keluar"
            exit 1
        }
    }
}

$systems = if ($System -eq "all") { @("sibi", "asl", "bisindo") } else { @($System) }

Write-Host ""
Write-Host "Sistem yang akan ditraining: $($systems -join ', ')" -ForegroundColor Green
Write-Host ""

# ── Loop per sistem ───────────────────────────────────────────────────────────
foreach ($sys in $systems) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  [1/3] Training: $($sys.ToUpper())" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    & $PYTHON train.py --system $sys

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Training $sys gagal!" -ForegroundColor Red
        continue
    }

    # Cek apakah model.h5 ada (berarti TF.js export belum berhasil)
    $h5Path = "$PROJECT\public\models\$sys\model.h5"

    if (Test-Path $h5Path) {
        Write-Host ""
        Write-Host "  [2/3] Converting $($sys.ToUpper()) ke TF.js format..." -ForegroundColor Yellow

        $convertScript = @"
import tensorflow as tf
import tensorflowjs as tfjs
import os

h5_path = r'$h5Path'
output_dir = r'$PROJECT\public\models\$sys'

print('Loading model...')
model = tf.keras.models.load_model(h5_path)

print('Converting to TF.js...')
tfjs.converters.save_keras_model(model, output_dir)

os.remove(h5_path)
print('Done! model.h5 dihapus.')
"@

        $tmpScript = "$PROJECT\tmp_convert.py"
        $convertScript | Set-Content $tmpScript -Encoding UTF8

        & $PYTHON $tmpScript

        Remove-Item $tmpScript -ErrorAction SilentlyContinue

        if ($LASTEXITCODE -ne 0) {
            Write-Host "  Convert gagal — model.h5 tetap tersimpan di $h5Path" -ForegroundColor Yellow
        } else {
            Write-Host "  Convert berhasil!" -ForegroundColor Green
        }
    } else {
        Write-Host "  [2/3] TF.js export sudah selesai saat training." -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "  [3/3] $($sys.ToUpper()) selesai!" -ForegroundColor Green
    Write-Host ""
}

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Semua training selesai!" -ForegroundColor Green
Write-Host "  Refresh browser untuk model terbaru." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Tekan Enter untuk keluar"
