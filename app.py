from flask import Flask, send_from_directory, jsonify
import os

app = Flask(__name__, static_folder='pages')

events = [
    {"id": 1, "title": "城市文化节", "description": "展示本地民俗与艺术", "date": "2026-01-20", "place": "市文化广场", "image": "/images/event1.jpg"},
    {"id": 2, "title": "传统音乐会", "description": "民乐演出", "date": "2026-02-05", "place": "市剧院", "image": "/images/event2.jpg"},
    {"id": 3, "title": "书画展览", "description": "本地书画家作品展", "date": "2026-03-10", "place": "美术馆", "image": "/images/event3.jpg"}
]


@app.route('/api/events')
def get_events():
    return jsonify({"code": 0, "data": events})


@app.route('/api/hello')
def hello():
    return jsonify({"msg": "Hello from Flask"})


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != '' and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=3000, debug=False)
