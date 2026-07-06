# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . .

# Expose port 8000 for local development (Render ignores this)
EXPOSE 8000

# Use shell form to allow environment variable expansion (crucial for Render's dynamic $PORT)
CMD uvicorn src.api:app --host 0.0.0.0 --port ${PORT:-8000}
