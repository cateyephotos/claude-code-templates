# pdf-generator — Puppeteer PDF service
# Uses node:20-slim + all Chromium system dependencies required for headless rendering.
# Runs as a non-root user (pptruser) for security.

FROM node:20-slim AS base

# Install system Chromium + all required libraries.
# Using the Debian-packaged Chromium is more reliable in Docker than downloading
# Puppeteer's bundled Chrome binary (postinstall can be inconsistent).
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    chromium \
    curl \
    fonts-liberation \
    fonts-noto-color-emoji \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    wget \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user to run Puppeteer (required for --no-sandbox to work safely)
RUN groupadd --system pptruser && \
    useradd --system --gid pptruser --home /home/pptruser --create-home pptruser

WORKDIR /app

# Copy package files and install dependencies as root so npm can write to node_modules
COPY package.json ./

# Skip puppeteer's bundled Chrome download — we use the system Chromium installed above.
# PUPPETEER_EXECUTABLE_PATH tells puppeteer where to find the binary at runtime.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
RUN npm install --omit=dev && npm cache clean --force

# Copy application source
COPY server.js ./

# Give pptruser ownership of the app directory including the Chrome cache
RUN chown -R pptruser:pptruser /app /home/pptruser

# Switch to non-root user
USER pptruser

# Expose the service port
EXPOSE 3001

# Health check — lightweight HTTP probe
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "server.js"]
