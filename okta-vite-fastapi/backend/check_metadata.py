import requests

# your Okta issuer
issuer = "https://trial-7255425.okta.com/oauth2/default"

# build the metadata URL
metadata_url = f"{issuer}/.well-known/openid-configuration"

response = requests.get(metadata_url)
response.raise_for_status()  # will raise error if request failed

metadata = response.json()

print("OpenID Metadata:")
print(metadata)