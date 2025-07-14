from flask import Flask, request, jsonify, render_template
from optimizer import optimize_logic
import time

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/optimize", methods=["POST"])
def optimize():
    data = request.get_json() or {}
    expression = data.get("expression", "").strip()
    method = data.get("method", "simplify")

    if not expression:
        # Kalau kosong, balas format lengkap agar frontend tidak error
        return jsonify({
            "simplified": "–",
            "explanation": "–",
            "variables": [],
            "table": [],
            "kmap": {},
            "minterm": [],
            "minterm_values": [],
            "prime_implicants": [],
            "implicant_chart": {},
            "essential_implicants": [],
            "groupings": [],
            "threads": [],
            "mainJoin": "",
            "duration": 0
        }), 200

    start_time = time.time()

    try:
        result = optimize_logic(expression, method=method)
        result["duration"] = round((time.time() - start_time) * 1000, 2)

        # Pastikan semua field ada meski kosong
        result.setdefault("simplified", "–")
        result.setdefault("explanation", "–")
        result.setdefault("variables", [])
        result.setdefault("table", [])
        result.setdefault("kmap", {})
        result.setdefault("minterm", [])
        result.setdefault("minterm_values", [])
        result.setdefault("prime_implicants", [])
        result.setdefault("implicant_chart", {})
        result.setdefault("essential_implicants", [])
        result.setdefault("groupings", [])
        result.setdefault("threads", [])
        result.setdefault("mainJoin", "")

        return jsonify(result), 200

    except Exception as e:
        print(f"Error during optimization: {e}")
        return jsonify({
            "simplified": "–",
            "explanation": "Terjadi error saat memproses.",
            "variables": [],
            "table": [],
            "kmap": {},
            "minterm": [],
            "minterm_values": [],
            "prime_implicants": [],
            "implicant_chart": {},
            "essential_implicants": [],
            "groupings": [],
            "threads": [],
            "mainJoin": "",
            "duration": 0
        }), 500


if __name__ == "__main__":
    app.run(debug=True)
