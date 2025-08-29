#!/bin/bash

set -e

echo "Updating package lists..."
sudo apt update -y
sudo apt upgrade -y

# -------------------------------
# Install JDK 17
# -------------------------------
echo "Installing OpenJDK 17..."
sudo apt install -y openjdk-17-jdk
echo "JDK version installed:"
java -version


# -------------------------------
# Install Maven
# -------------------------------
echo "Installing Maven..."
sudo apt install -y maven
echo "Maven version:"
mvn -v


# -------------------------------
# Install Node.js & npm (for React)
# -------------------------------
echo "Installing Node.js and npm..."
# Using NodeSource PPA for latest LTS Node
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
echo "Node.js version:"
node -v
echo "npm version:"
npm -v

