from fastapi import FastAPI, HTTPException
from yt_dlp import YoutubeDL
import os

app = FastAPI()

@app.get("/api/info")
def get_info(url: str):
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
    cookie_path = os.path.join(os.path.dirname(__file__), 'cookies.txt')
    temp_cookie_path = "/tmp/cookies.txt"
    
    if os.path.exists(cookie_path):
        try:
            import shutil
            shutil.copy2(cookie_path, temp_cookie_path)
            cookie_path = temp_cookie_path
        except Exception:
            pass

    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'nocheckcertificate': True,
        'ignoreerrors': False,
        'logtostderr': False,
        'cookiefile': cookie_path if os.path.exists(cookie_path) else None,
    }
    
    try:
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            if not info:
                raise HTTPException(status_code=400, detail="YouTube is blocking this request even with cookies. Try a different video or wait a while.")
            
            # Filter and sanitize formats
            formats = []
            for f in info.get('formats', []):
                if not f.get('url'):
                    continue
                
                # Determine if it's video+audio, video only, or audio only
                vcodec = f.get('vcodec', 'none')
                acodec = f.get('acodec', 'none')
                
                kind = "video"
                if vcodec == 'none' and acodec != 'none':
                    kind = "audio"
                elif vcodec != 'none' and acodec != 'none':
                    kind = "both"
                elif vcodec != 'none' and acodec == 'none':
                    kind = "video_only"

                formats.append({
                    "format_id": f.get('format_id'),
                    "ext": f.get('ext'),
                    "resolution": f.get('resolution') or f.get('format_note') or 'Unknown',
                    "url": f.get('url'),
                    "filesize": f.get('filesize'),
                    "kind": kind,
                    "vcodec": vcodec,
                    "acodec": acodec,
                })
            
            # Sort: both first, then video_only, then audio
            formats.sort(key=lambda x: (x['kind'] != 'both', x['kind'] != 'video_only'))

            return {
                "title": info.get('title'),
                "thumbnail": info.get('thumbnail'),
                "duration": info.get('duration'),
                "uploader": info.get('uploader'),
                "view_count": info.get('view_count'),
                "formats": formats
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/health")
def health():
    return {"status": "ok"}
