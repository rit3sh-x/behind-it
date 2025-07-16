# Behind It: Audio CNN Analysis Platform

This project provides a full-stack solution for training, serving, and visualizing a convolutional neural network for audio classification using the ESC-50 dataset. It includes a Modal-based backend for training and inference, and a Next.js frontend for uploading audio files and visualizing model predictions and feature maps.

---

## Prerequisites

- Python 3.9+
- Node.js 18+
- Modal account (for cloud execution)
- [Modal](https://modal.com/) Python package
- [Next.js](https://nextjs.org/) and dependencies

---

## Backend Setup (Model Training & Inference)

### 1. Install Python Dependencies

```sh
cd model
pip install -r requirements.txt
```

### 2. Train the Model on Modal

The training script uses Modal to set up the environment, download the ESC-50 dataset, and train the CNN model. The best model is saved to a Modal volume.

To start training:

```sh
modal run train.py
```

- The dataset is downloaded and extracted inside the Modal container.
- Training and validation splits are created from the ESC-50 metadata.
- The model is trained for 100 epochs with mixup augmentation and OneCycleLR scheduling.
- The best model checkpoint is saved to `/models/best_model.pth` in the Modal volume.

### 3. Serve the Model for Inference

The inference API is defined in `main.py` using Modal's FastAPI integration.

To deploy the inference endpoint:

```sh
modal deploy main.py
```

- The endpoint expects a POST request with a base64-encoded WAV file.
- The model processes the audio, computes predictions, feature maps, spectrogram, and waveform data.
- The response includes top predictions, feature maps, input spectrogram, and waveform.

---

## Frontend Setup (Next.js Visualization)

### 1. Install Node.js Dependencies

```sh
cd frontend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and set your inference endpoint URL:

```
INFERENCE_URL="https://your-modal-endpoint-url"
```

If you use the API route proxy, set `INFERENCE_URL` in `.env.local` to your Modal endpoint.

### 3. Run the Frontend

```sh
npm run dev
```

- The frontend is built with Next.js and React.
- Users can upload WAV files.
- The file is converted to base64 and sent to the inference endpoint.
- Predictions, feature maps, spectrogram, and waveform are visualized.

---

## Project Structure

- `model/`  
  - `train.py`: Modal training script for ESC-50 dataset.
  - `main.py`: Modal FastAPI inference endpoint.
  - `model.py`: CNN model definition.
- `frontend/`  
  - `src/app/`: Next.js app directory.
  - `src/lib/utils.ts`: Audio upload and backend call logic.
  - `src/types/index.ts`: Type definitions for API responses.
  - `src/components/`: UI components for visualization.

---

## How Inference Works

1. The frontend reads the WAV file, encodes it as base64, and sends it to the backend.
2. The backend decodes the audio, resamples if needed, and computes the spectrogram.
3. The model predicts the top classes and extracts feature maps.
4. The backend returns predictions, feature maps, input spectrogram, and waveform data.
5. The frontend displays all results interactively.