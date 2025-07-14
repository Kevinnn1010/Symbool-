from sympy import symbols, simplify_logic, true, false
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application
)
from sympy.logic.boolalg import truth_table
from concurrent.futures import ThreadPoolExecutor
from sympy.logic.boolalg import SOPform
from sympy import Symbol
import re

# ===============================
# SIMBOL BOOLEAN A-Z
# ===============================
var_symbols = symbols('A:Z')
locals_dict = {str(s): s for s in var_symbols}
transformations = standard_transformations + (implicit_multiplication_application,)

# ===============================
# MAPPING SIMBOL UI → PYTHON
# ===============================
symbol_map = {
    "¬": "~",
    "∧": "&",
    "∨": "|",
    "⊕": "^",
    "→": ">>",
    "↔": "<<>>",
    "↑": "↑",
    "↓": "↓",
    "⊤": "True",
    "⊥": "False"
}

# ===============================
# VALIDASI INPUT
# ===============================
def validate_expression(expr_str):
    expr_str = expr_str.upper()
    allowed_pattern = r'^[A-Z¬∧∨⊕→↔↑↓⊤⊥()\s]*$'
    return re.match(allowed_pattern, expr_str) is not None

# ===============================
# GANTI SIMBOL KE PYTHONIC
# ===============================
def replace_symbols(expr_str):
    expr_str = expr_str.upper()
    for sym, rep in symbol_map.items():
        expr_str = expr_str.replace(sym, rep)
    expr_str = re.sub(r'([A-Z])\s*<<>>\s*([A-Z])', r'((\1 & \2) | (~\1 & ~\2))', expr_str)
    expr_str = re.sub(r'([A-Z])\s*\^\s*([A-Z])', r'((\1 & ~\2) | (~\1 & \2))', expr_str)
    expr_str = re.sub(r'([A-Z])\s*↑\s*([A-Z])', r'~(\1 & \2)', expr_str)
    expr_str = re.sub(r'([A-Z])\s*↓\s*([A-Z])', r'~(\1 | \2)', expr_str)
    return expr_str

# ===============================
# FORMAT SIMBOL PYTHON → UI
# ===============================
def format_ui_symbols(s):
    return s.replace("&", "∧").replace("|", "∨").replace("~", "¬").replace("True", "⊤").replace("False", "⊥")


# ===============================
# PENYEDERHANAAN BOOLEAN
# ===============================
def simplify_boolean(expr_str, method="dnf"):
    if not validate_expression(expr_str):
        return "–", "Input mengandung karakter tidak valid."

    expr_clean = replace_symbols(expr_str)
    expr = parse_expr(expr_clean, transformations=transformations, local_dict=locals_dict, evaluate=True)
    num_vars = len(expr.free_symbols)

    if method == "kmap" and num_vars > 4:
        return "–", "Metode Karnaugh Map hanya mendukung maksimal 4 variabel."
    if method == "qm" and num_vars > 8:
        return "–", "Metode Quine-McCluskey hanya praktis sampai 8 variabel."

    if method == "qm":
        # ⏩ Abaikan simpifier default kalau Q-M,
        # biar hitung Q-M manual di optimize_logic.
        return "–", "Menggunakan metode Quine-McCluskey manual."

    try:
        simplified = simplify_logic(expr, form="dnf")
    except Exception:
        simplified = simplify_logic(expr, form="dnf")

    if simplified != true and simplified != false:
        tt = list(truth_table(expr, expr.free_symbols))
        only_false = all([not v for _, v in tt])
        only_true = all([v for _, v in tt])
        if only_false:
            simplified = false
        elif only_true:
            simplified = true

    if simplified == true:
        explanation = "Ekspresi selalu benar (tautologi)."
    elif simplified == false:
        explanation = "Ekspresi selalu salah (kontradiksi)."
    else:
        explanation = "Ekspresi dapat bernilai True pada kondisi tertentu."

    return format_ui_symbols(str(simplified)), explanation


# ===============================
# TABEL KEBENARAN
# ===============================
def generate_truth_table(expr_str):
    expr_clean = replace_symbols(expr_str)
    expr = parse_expr(expr_clean, transformations=transformations, local_dict=locals_dict, evaluate=True)
    vars_used = sorted(expr.free_symbols, key=lambda x: x.name)
    vars_used = [str(v) for v in vars_used]  # ⏩ PASTIKAN str

    def eval_row(row_input):
        input_dict = dict(zip(vars_used, row_input))
        result = expr.subs(input_dict)
        return {str(k): bool(v) for k, v in input_dict.items()}, bool(result)

    table = []
    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(eval_row, row_input) for row_input, _ in truth_table(expr, vars_used)]
        for f in futures:
            table.append(f.result())

    return vars_used, table  # ⏩ PASTI str


# ===============================
# K-MAP GENERATOR
# ===============================
def generate_kmap(variables, truth_table_data):
    # ⏩ Pastikan semua str
    variables = [str(v) for v in variables]
    num_vars = len(variables)
    if num_vars < 2 or num_vars > 4:
        return None

    def gray_code(n):
        return n ^ (n >> 1)

    row_bits = num_vars // 2
    col_bits = num_vars - row_bits

    row_vars = variables[:row_bits]
    col_vars = variables[row_bits:]

    row_labels = [format(gray_code(i), f'0{row_bits}b') for i in range(2 ** row_bits)]
    col_labels = [format(gray_code(i), f'0{col_bits}b') for i in range(2 ** col_bits)]

    grid = [[0 for _ in col_labels] for _ in row_labels]

    for row in truth_table_data:
        inputs, output = row
        bits = ''.join(['1' if inputs[v] else '0' for v in variables])
        row_idx = int(bits[:row_bits], 2)
        col_idx = int(bits[row_bits:], 2)
        grid[gray_code(row_idx)][gray_code(col_idx)] = int(output)

    return {
        "rows": row_labels,
        "cols": col_labels,
        "grid": grid,
        "corner_label_row": ''.join(row_vars),
        "corner_label_col": ''.join(col_vars)
    }

# ===============================
# HITUNG MINTERM
# ===============================
def extract_minterms(variables, truth_table_data):
    minterms = []
    minterm_values = []
    for row in truth_table_data:
        inputs, output = row
        if output:
            bits = ''.join(['1' if inputs[v] else '0' for v in variables])
            minterm_values.append(bits)
            minterms.append(str(int(bits, 2)))
    return minterms, minterm_values



# ===============================
# QUINE–MCCLUSKEY FINAL SESUAI SPESIFIKASI
# ===============================
def quine_mccluskey_process(variables, minterms):
    num_vars = len(variables)
    minterm_ints = sorted(map(int, minterms))

    # ============ STORAGE SEMUA LANGKAH ============
    history_steps = []

    # ============ 1️⃣ Prime Implicant Table 1 ============
    groups = {}
    for m in minterm_ints:
        ones = bin(m).count("1")
        binary = format(m, f"0{num_vars}b")
        groups.setdefault(ones, []).append({
            "decimal": [m],
            "binary": binary,
            "checked": False
        })

    table1 = []
    for ones, group in sorted(groups.items()):
        for g in group:
            table1.append({
                "group": ones,
                "decimal": g["decimal"],
                "binary": g["binary"],
                "cost": g["binary"].count("1")
            })
    history_steps.append({
        "stage": "Prime Implicant Table 1",
        "data": table1
    })

    # ============ 2️⃣ Prime Implicant Table 2 (Iterasi) ============
    prime_implicants = []
    iter_tables = []
    step_num = 2

    while True:
        next_groups = {}
        combined = False
        step_table = []

        keys = sorted(groups.keys())
        for k in keys:
            group1 = groups[k]
            group2 = groups.get(k + 1, [])

            for g1 in group1:
                for g2 in group2:
                    # Cek perbedaan 1-bit
                    diff = [i for i in range(num_vars) if g1["binary"][i] != g2["binary"][i]]
                    if len(diff) == 1:
                        idx = diff[0]
                        new_bin = list(g1["binary"])
                        new_bin[idx] = "-"
                        new_bin = "".join(new_bin)
                        new_decimal = sorted(set(g1["decimal"] + g2["decimal"]))
                        ones_new = new_bin.count("1")

                        new_item = {
                            "decimal": new_decimal,
                            "binary": new_bin,
                            "checked": False
                        }

                        if new_item not in next_groups.get(ones_new, []):
                            next_groups.setdefault(ones_new, []).append(new_item)
                            step_table.append({
                                "group": ones_new,
                                "decimal": new_decimal,
                                "binary": new_bin,
                                "cost": new_bin.count("1")
                            })
                            combined = True

                        g1["checked"] = True
                        g2["checked"] = True

        # Simpan tabel iterasi
        if step_table:
            iter_tables.append({
                "stage": f"Prime Implicant Table {step_num}",
                "data": step_table
            })
            step_num += 1

        # Tandai yang tidak digabung jadi prime implicant
        for k in keys:
            for g in groups[k]:
                if not g["checked"]:
                    prime_implicants.append(g)

        if not combined:
            break

        groups = next_groups

    history_steps.extend(iter_tables)

    # ============ 3️⃣ Bersihkan Duplikat Prime Implicants ============
    seen = set()
    clean_pi = []
    for pi in prime_implicants:
        key = (tuple(pi["decimal"]), pi["binary"])
        if key not in seen:
            seen.add(key)
            clean_pi.append(pi)
    prime_implicants = clean_pi

    # ============ 4️⃣ Prime Implicant Expression ============
    pi_expressions = []
    for pi in prime_implicants:
        expr = []
        for b, v in zip(pi["binary"], variables):
            if b == "1":
                expr.append(v)
            elif b == "0":
                expr.append(f"¬{v}")
        pi_expressions.append({
            "binary": pi["binary"],
            "expression": "∧".join(expr)
        })
    history_steps.append({
        "stage": "Prime Implicant Expression",
        "data": pi_expressions
    })

    # ============ 5️⃣ Prime Implicant Chart ============
    chart = []
    for pi in prime_implicants:
        row = {
            "PI": pi["binary"],
            "expression": next(x["expression"] for x in pi_expressions if x["binary"] == pi["binary"]),
            "covered": pi["decimal"],
            "cost": len(pi["decimal"])
        }
        for m in minterm_ints:
            row[str(m)] = "X" if m in pi["decimal"] else ""
        chart.append(row)
    history_steps.append({
        "stage": "Prime Implicant Chart",
        "data": chart
    })

    # ============ 6️⃣ Finding Unique Minterm ============
    coverage = {m: [] for m in minterm_ints}
    for pi in prime_implicants:
        for m in pi["decimal"]:
            coverage[m].append(pi["binary"])

    essential = []
    for m, pis in coverage.items():
        if len(pis) == 1:
            if pis[0] not in essential:
                essential.append(pis[0])

    unique_chart = []
    for row in chart:
        row_copy = dict(row)
        row_copy["essential"] = "Yes" if row["PI"] in essential else ""
        unique_chart.append(row_copy)
    history_steps.append({
        "stage": "Finding Unique Minterm",
        "data": unique_chart
    })

    # ============ 7️⃣ Final Answer ============
    def bin_to_expr(bin_str):
        terms = []
        for b, v in zip(bin_str, variables):
            if b == "1":
                terms.append(v)
            elif b == "0":
                terms.append(f"¬{v}")
        return "∧".join(terms) if terms else "-"

    final_expr = " ∨ ".join([bin_to_expr(pi) for pi in essential]) if essential else "-"

    return {
        "prime_implicant_table_1": table1,
        "prime_implicant_table_2": [
        step["data"] for step in history_steps
        if step["stage"].startswith("Prime Implicant Table ") and step["stage"] != "Prime Implicant Table 1"
    ],
        "prime_implicant_expression": pi_expressions,
        "prime_implicant_chart": chart,
        "finding_unique": unique_chart,
        "essential_prime_implicants": essential,
        "final_expression": final_expr,
        "history_steps": history_steps
    }


def optimize_logic(expr_str, method="default"):
    # ========================================
    # VALIDASI & PRE-PROSES EKSPRESI
    # ========================================
    simplified, explanation = simplify_boolean(expr_str, method)
    expr_clean = replace_symbols(expr_str)
    expr = parse_expr(expr_clean, transformations=transformations, local_dict=locals_dict, evaluate=True)

    # Dapatkan variabel & tabel kebenaran
    variables, table = generate_truth_table(expr_str)

    # Init output
    kmap = None
    minterms = []
    minterm_values = []
    threads = []
    groupings = []
    main_join = ""

    # Untuk Q-M
    prime_implicant_table_1 = []
    prime_implicant_table_2 = []
    prime_implicant_expression = []
    prime_implicant_chart = []
    finding_unique = []
    essential_implicants = []
    final_expression = "-"
    history_steps = []

    # ========================================
    # CEK BATAS & METODE
    # ========================================
    if method == "kmap" and len(variables) > 4:
        simplified = "–"
        explanation = "Metode Karnaugh Map hanya mendukung maksimal 4 variabel."
    elif method == "qm" and len(variables) > 8:
        simplified = "–"
        explanation = "Metode Quine–McCluskey hanya mendukung maksimal 8 variabel."
    else:
        if table:
            # Hitung Minterms
            minterms, minterm_values = extract_minterms(variables, table)

            if method == "kmap":
                kmap = generate_kmap(variables, table)

            elif method == "qm":
                if minterms:
                    qm_data = quine_mccluskey_process(variables, minterms)

                    prime_implicant_table_1 = qm_data["prime_implicant_table_1"]
                    prime_implicant_table_2 = qm_data["prime_implicant_table_2"]
                    prime_implicant_expression = qm_data["prime_implicant_expression"]
                    prime_implicant_chart = qm_data["prime_implicant_chart"]
                    finding_unique = qm_data["finding_unique"]
                    essential_implicants = qm_data["essential_prime_implicants"]
                    final_expression = qm_data["final_expression"]
                    history_steps = qm_data["history_steps"]

                    simplified = final_expression
                    main_join = f"Essential PI: {essential_implicants} => {simplified}"
                    explanation = "Ekspresi disederhanakan dengan metode Quine–McCluskey."
                else:
                    simplified = "⊥"
                    explanation = "Tidak ada minterm True, hasil False."
        else:
            simplified = "–"
            explanation = "Ekspresi tidak valid atau tabel gagal dibuat."

    # ========================================
    # TRACE LANGKAH DNF (jika non-QM)
    # ========================================
    if simplified not in ["⊤", "⊥", "–"] and table and method != "qm":
        dnf_parts = [p.strip() for p in simplified.split("∨")]

        def clean(term):
            return term.replace("(", "").replace(")", "").strip()

        for i, term in enumerate(dnf_parts):
            literals = [clean(lit) for lit in term.split("∧")]
            steps = [f"▶ Mulai term ke-{i+1}: {term}"]

            example_row = None
            for row in table:
                inputs, output = row
                valid = True
                for lit in literals:
                    if lit.startswith("¬"):
                        var = lit[1:]
                        val = not inputs.get(var, False)
                    else:
                        var = lit
                        val = inputs.get(var, False)
                    if not val:
                        valid = False
                        break
                if valid and output:
                    example_row = inputs
                    break

            if example_row:
                if len(literals) > 1:
                    steps.append(f"Pecah term: {', '.join(literals)}")
                for lit in literals:
                    if lit.startswith("¬"):
                        var = lit[1:]
                        raw = example_row.get(var, False)
                        val = not raw
                        steps.append(f"Evaluasi ¬{var} = ¬{raw} = {val}")
                    else:
                        var = lit
                        val = example_row.get(var, False)
                        steps.append(f"Evaluasi {var} = {val}")
                if len(literals) > 1:
                    steps.append(f"Gabungkan: {' ∧ '.join(literals)} = True")
                else:
                    steps.append(f"Literal {literals[0]} valid → True")
            else:
                steps.append("Tidak ada baris tabel cocok untuk term ini.")

            threads.append({
                "name": term,
                "steps": steps
            })

        # Grouping DNF
        g_count = 1
        grouped_results = []
        i = 0
        while i < len(dnf_parts):
            t1 = dnf_parts[i]
            if i + 1 < len(dnf_parts):
                t2 = dnf_parts[i + 1]
                steps = [
                    f"Ambil Thread {i+1}: {t1}",
                    f"Ambil Thread {i+2}: {t2}",
                    f"Gabungkan: ({t1}) ∨ ({t2})"
                ]
                result = f"({t1}) ∨ ({t2})"
                groupings.append({
                    "group": f"Group {g_count}",
                    "threads": {
                        f"Thread {i+1}": t1,
                        f"Thread {i+2}": t2
                    },
                    "steps": steps,
                    "result": result
                })
                grouped_results.append(result)
                i += 2
            else:
                steps = [
                    f"Ambil Thread {i+1}: {t1}",
                    f"Gabungkan: ({t1})"
                ]
                result = f"({t1})"
                groupings.append({
                    "group": f"Group {g_count}",
                    "threads": {f"Thread {i+1}": t1},
                    "steps": steps,
                    "result": result
                })
                grouped_results.append(result)
                i += 1

            g_count += 1

        main_join = f"Gabungkan semua group: {' ∨ '.join(grouped_results)} = {simplified}"

    # ========================================
    # RETURN FINAL
    # ========================================
    return {
        "simplified": simplified,
        "explanation": explanation,
        "variables": variables,
        "table": table,
        "kmap": kmap,
        "minterm": f"m({','.join(minterms)})" if minterms else "",
        "minterm_values": ', '.join(minterm_values) if minterm_values else "",
        "prime_implicant_table_1": prime_implicant_table_1,
        "prime_implicant_table_2": prime_implicant_table_2,
        "prime_implicant_expression": prime_implicant_expression,
        "prime_implicant_chart": prime_implicant_chart,
        "finding_unique": finding_unique,
        "essential_implicants": essential_implicants,
        "threads": threads,
        "groupings": groupings,
        "mainJoin": main_join,
        "history_steps": history_steps
    }