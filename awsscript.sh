#!/bin/bash

# --- Start of Script ---
set -e

# This script automates the installation of the AWS CLI and Docker on a Linux system.
# It requires 'sudo' privileges to install packages and run the installation scripts.

echo "Starting the installation process for AWS CLI and Docker..."
echo "You may be prompted for your password to proceed with 'sudo' commands."

# ================================================
# Section 1: Install AWS CLI v2
# ================================================

echo ""
echo "--- Installing prerequisites for AWS CLI (unzip) ---"
sudo apt-get update
sudo apt-get install -y unzip

echo ""
echo "--- Downloading and verifying AWS CLI v2 installer ---"
# Download the installer and its signature
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
curl -o awscliv2.sig https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip.sig

# Verify the signature of the installer (optional but recommended)
echo "Verifying the downloaded file signature..."
if gpg --verify awscliv2.sig awscliv2.zip; then
  echo "Signature verification successful."
else
  echo "WARNING: Signature verification failed. Proceeding anyway..."
fi

# Unzip the installer package
echo "Unzipping the installer..."
unzip awscliv2.zip

# Run the official AWS install script
echo "Running the AWS CLI installation script..."
sudo ./aws/install

# Clean up the downloaded files
echo "Cleaning up temporary files..."
rm -rf awscliv2.zip awscliv2.sig aws

echo "AWS CLI installation complete."

# ================================================
# Section 2: Install Docker
# ================================================

echo ""
echo "--- Downloading and running the official Docker installation script ---"
# The -fsSL flags ensure a silent, fast, and secure download with redirects followed
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

echo "Docker installation complete."
echo "You may need to log out and log back in, or run 'newgrp docker' for the changes to take effect."

echo ""
echo "Installation process finished successfully! You can now use 'aws' and 'docker' commands."
# --- End of Script ---
