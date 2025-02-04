#!/usr/bin/env python3
from flask_socketio import emit
from flask import current_app as app
import ollama
import tiktoken

def generate_prompt(content):
    """
    Build the text prompt you want to send to Ollama.
    """
    prompt = """
### INSTRUCTION: 
The following text is a Knowledge Base article for a Nutanix product. This article is to be converted to a video to assist users of the product run the steps outlined in the article themselves. Your task is to generate a script for this video, based on the article contents. 

Where multiple options or scenarios are presented in the article, choose the most common path to be presented in the video.

Your script will be converted to speech using TTS, and someone will manually generate the visuals based on your script, you should account for this in the pacing of the script. For pauses, add “...” on a new line, however, do not include any additional annotation or direction (i.e. do NOT include annotations such as [Intro music plays]), just the script. Do not include any preamble, only generate the script that is to be fed directly to an AI TTS (i.e. do NOT include something like “here is your script”).

### KB ARTICLE CONTENT:
"""
    return prompt + "\n\n" + content

def write_script(prompt):
    """
    Pass the prompt to Ollama via subprocess.
    Capture the model's response from stdout.
    """

    resp = ollama.stream(
        model='llama3.3',
        prompt=prompt,
        max_context_length=8192,
    )

    for chunk in resp:
        # Step 3 of protocol: stream back tokens as they are generated.
        emit("tokens", {"tokens": chunk['token']})

    # Step 4 of protocol: send a completion event.
    emit("complete", {})

def generate(content):
    """
    High-level function that builds the prompt,
    calls Ollama, and returns the AI's completion.
    """
    prompt = generate_prompt(content)

    # Count tokens using OpenAI's tokenizer
    # The Llama tokenizer can't be used as access must be granted by the model author.
    enc = tiktoken.get_encoding("gpt2")
    tokens = enc.encode(prompt)
    token_count = len(tokens)

    app.logger.debug(f"Token count is {token_count}")

    write_script(prompt)
