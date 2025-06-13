
import os
from openai import AzureOpenAI

endpoint = os.getenv("ENDPOINT_URL", "https://testinggroup1.openai.azure.com/")
deployment = os.getenv("DEPLOYMENT_NAME", "gpt-4.1-nano")
subscription_key = os.getenv("AZURE_OPENAI_API_KEY", "6rIkD8vKAcVCL3RA3bpjlebso0ciMEJmO9jsTMBfaxfWFL1NYuszJQQJ99BFACYeBjFXJ3w3AAABACOGytG4")

# Initialize Azure OpenAI client with key-based authentication
client = AzureOpenAI(
    azure_endpoint=endpoint,
    api_key=subscription_key,
    api_version="2025-01-01-preview",
)

text = "Hi, how are you?"
#Prepare the chat prompt
chat_prompt = [
    {
        "role": "system",
        "content": [
            {
                "type": "text",
                "text": "summarize the following text{text}"
            }
        ]
    }
]

# Include speech result if speech is enabled
messages = chat_prompt

# Generate the completion
completion = client.chat.completions.create(
    model=deployment,
    messages=messages,
    max_tokens=800,
    temperature=1,
    top_p=1,
    frequency_penalty=0,
    presence_penalty=0,
    stop=None,
    stream=False
)

print(completion.to_json())