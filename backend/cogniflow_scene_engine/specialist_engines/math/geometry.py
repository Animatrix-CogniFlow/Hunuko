from typing import Dict, Any, List

def calculate_midpoint_2d(p1: List[float], p2: List[float]) -> Dict[str, Any]:
    mx = (p1[0] + p2[0]) / 2.0
    my = (p1[1] + p2[1]) / 2.0
    return {"operation": "2D Midpoint", "point_1": p1, "point_2": p2, "midpoint": [mx, my], "midpoint_label": f"M({mx}, {my})"}
