<!-- HEADY_BRAND:BEGIN -->
<!-- ╔══════════════════════════════════════════════════════════════════╗ -->
<!-- ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║ -->
<!-- ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║ -->
<!-- ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║ -->
<!-- ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║ -->
<!-- ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║ -->
<!-- ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║ -->
<!-- ║                                                                  ║ -->
<!-- ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║ -->
<!-- ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║ -->
<!-- ║  FILE: COLAB_PROTOCOL.md                                          ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

# Heady Colab Protocol

This protocol describes how to leverage Google Colab's free GPU resources to run the Heady Admin Console and its AI capabilities.

## Prerequisites

- A Google Account
- An [Ngrok Account](https://ngrok.com/) (Free tier is sufficient) for tunneling the web interface.

## Steps

1.  **Download the Notebook:**
    Download the file `notebooks/Heady_Colab_Protocol.ipynb` from this repository.

2.  **Upload to Colab:**
    - Go to [Google Colab](https://colab.research.google.com/).
    - Click **File > Upload notebook**.
    - Select the `Heady_Colab_Protocol.ipynb` file.

3.  **Enable GPU:**
    - In the Colab interface, go to **Runtime > Change runtime type**.
    - Set **Hardware accelerator** to **GPU**.
    - Click **Save**.

4.  **Run the Protocol:**
    - Execute the cells in order.
    - **Cell 1:** Verifies GPU availability.
    - **Cell 2:** Clones the Heady repository (you may need to update the URL if using a private fork or different branch).
    - **Cell 3:** Installs dependencies (`requirements.txt`).
    - **Cell 4:** Prompts for your Ngrok Authtoken. Enter it to create a public tunnel.
    - **Cell 5:** Starts the Admin Console server.

5.  **Access the IDE:**
    - Copy the `public_url` printed by Cell 4 (e.g., `https://xxxx-xx-xx-xx-xx.ngrok-free.app`).
    - Open it in your browser.
    - Use the Admin Token set in Cell 5 (default: `colab_secure_token`) to authenticate if prompted (or set it in your local storage via the console).

## Benefits

- **GPU Acceleration:** The `NLPService` will automatically detect the Colab GPU and use it for Hugging Face models (`T5`, `DistilGPT2`), significantly speeding up text generation and summarization.
- **Zero Local Setup:** No need to install Python or Node.js locally.
- **Remote Access:** Access your Admin IDE from anywhere via the Ngrok tunnel.
