import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = {
    "web-home.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzNiZWU2MjlkZDY3NTQwMTZhMTVlMDYzMjQ5OWFjZTNjEgsSBxCwr8-dtQMYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzg3NjgwMzA5MjMwMDI3MDU4MA&filename=&opi=89354086",
    "mobile-home.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2E1N2UwMmJkNGE2ZTQ1YWVhOGFiNmM5ZWQ4NjYzNzA2EgsSBxCwr8-dtQMYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzg3NjgwMzA5MjMwMDI3MDU4MA&filename=&opi=89354086",
    "web-catalog.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2MzMzZiOWMxZjU5NDRmZmQ4MmQ4YzljOTdiODBjYzg3EgsSBxCwr8-dtQMYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzg3NjgwMzA5MjMwMDI3MDU4MA&filename=&opi=89354086",
    "mobile-catalog.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzc3NTcyODRhODVhNDQxYmU5ODg3ZDZjYzg5OTAwYzgxEgsSBxCwr8-dtQMYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzg3NjgwMzA5MjMwMDI3MDU4MA&filename=&opi=89354086"
}

for name, url in urls.items():
    print(f"Downloading {name}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx) as response, open('/Users/nidhiverma/airbnb-manager/.stitch/' + name, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
    except Exception as e:
        print(f"Failed {name}: {e}")
