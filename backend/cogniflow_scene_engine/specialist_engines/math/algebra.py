from sympy import symbols, solve
from typing import Dict, Any

def solve_linear_equation(equation_str: str, variable_symbol: str = "x") -> Dict[str, Any]:
    try:
        x = symbols(variable_symbol)
        solution = solve(equation_str, x)
        return {"operation": "Linear Algebra Solve", "equation": equation_str, "solution": [float(val) for val in solution]}
    except Exception as e:
        return {"status": "error", "message": str(e)}
