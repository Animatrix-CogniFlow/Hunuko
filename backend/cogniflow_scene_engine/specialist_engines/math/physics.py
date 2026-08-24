from sympy import symbols, Eq, solve
from typing import Dict, Any

def solve_physics_variables(var_map: Dict[str, float]) -> Dict[str, Any]:
    m_val = var_map.get("m") or var_map.get("mass")
    a_val = var_map.get("a") or var_map.get("acceleration")
    if m_val is not None and a_val is not None:
        m, a, F = symbols('m a F')
        eq = Eq(F, m * a)
        result = float(solve(eq.subs({m: m_val, a: a_val}), F)[0])
        return {"formula": "F = m * a", "calculated_variable": "Force (F)", "result_value": result, "unit": "N"}
    return {"status": "insufficient_variables"}
