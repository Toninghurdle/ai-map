"""Rebuild the standalone reference page from head.html, body.html and two JSON files.

Usage: python3 build.py MAP_DATA.json ORGS.json OUT.html

MAP_DATA.json is the map-view file (v1.2 shape with coverage_status, or v2 shape with capacity/home).
ORGS.json is {"orgs": [...], "edges": [...]}. If MAP_DATA.json already carries "orgs" and "edges",
pass an empty object file for ORGS.json. Both are embedded as JSON script blocks; "</" is escaped.
"""
import json, os, sys

here = os.path.dirname(os.path.abspath(__file__))
data_path, orgs_path, out = sys.argv[1], sys.argv[2], sys.argv[3]

def block(path):
    return json.dumps(json.load(open(path)), ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')

head = open(os.path.join(here, 'head.html')).read()
body = open(os.path.join(here, 'body.html')).read().replace('/*__DATA__*/', block(data_path)).replace('/*__ORGS__*/', block(orgs_path))
page = ('<!doctype html>\n<html lang="en-GB">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        + head + '</head>\n<body>\n' + body + '</body>\n</html>\n')
open(out, 'w').write(page)
print(out, len(page.encode()) // 1024, 'KB')
