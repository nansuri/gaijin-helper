# Local Translator

This is a simple web-based translation tool that uses the browser's built-in microphone and speech recognition capabilities, and the LibreTranslate API for translation.

## Features

*   Translate between English, Japanese, and Indonesian.
*   Transcribe audio from the microphone.
*   Translate the transcribed text.
*   Speak the translated text.

## How to Use

1.  Open the `index.html` file in a web browser. Google Chrome is recommended for compatibility with the Web Speech API.
2.  Select the "from" and "to" languages using the dropdown menus.
3.  Click the "Start Listening" button to start the real-time translation.
4.  Speak into your microphone. The transcribed text will appear in the left text area, and the translated text will appear in the right text area in real-time.
5.  Click the "Stop Listening" button to stop the translation.
6.  Click the "Speak" button to hear the translated text.

## Dependencies

*   This tool uses the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for speech recognition, which is currently only supported by some browsers (notably Google Chrome).
*   This tool is configured to use a **locally deployed LibreTranslate instance**.

### Running LibreTranslate Locally with Podman

To run LibreTranslate locally, you need to have Podman installed. Then, execute the following commands in your terminal:

1.  **Pull the LibreTranslate image:**
    \`\`\`bash
    podman pull libretranslate/libretranslate
    \`\`\`

2.  **Run the LibreTranslate container:**
    \`\`\`bash
    podman run -it --rm -p 5050:5000 -e LT_LOAD_ONLY=\"en,id,ja\" libretranslate/libretranslate
    \`\`\`

Once the container is running, LibreTranslate will be accessible at \`http://localhost:5050\`. The \`script.js\` file in this project is configured to use this endpoint for translations.
