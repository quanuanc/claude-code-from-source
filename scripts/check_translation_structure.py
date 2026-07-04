#!/usr/bin/env python3
"""Lightweight structure checks for the zh-CN translation scaffold."""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
EN_BOOK = ROOT / "book"
ZH_BOOK = ROOT / "book-zh"

FENCE_RE = re.compile(r"^```(\w+)?", re.M)
HEADING_RE = re.compile(r"^(#{1,6})\s+", re.M)


def count_fences(text: str):
    counts = {}
    for lang in FENCE_RE.findall(text):
        lang = lang or ""
        counts[lang] = counts.get(lang, 0) + 1
    return counts


def main() -> int:
    errors = []
    en_files = sorted(EN_BOOK.glob("ch*.md"))
    zh_files = sorted(ZH_BOOK.glob("ch*.md"))

    if len(en_files) != len(zh_files):
        errors.append(f"chapter count mismatch: en={len(en_files)} zh={len(zh_files)}")

    for en in en_files:
        zh = ZH_BOOK / en.name
        if not zh.exists():
            errors.append(f"missing zh chapter: {zh.relative_to(ROOT)}")
            continue
        en_text = en.read_text()
        zh_text = zh.read_text()

        en_fences = count_fences(en_text)
        zh_fences = count_fences(zh_text)
        if en_fences != zh_fences:
            errors.append(
                f"fenced code block mismatch in {en.name}: en={en_fences} zh={zh_fences}"
            )

        en_headings = len(HEADING_RE.findall(en_text))
        zh_headings = len(HEADING_RE.findall(zh_text))
        # zh scaffold adds an HTML comment only, so heading counts should match.
        if en_headings != zh_headings:
            errors.append(
                f"heading count mismatch in {en.name}: en={en_headings} zh={zh_headings}"
            )

    if errors:
        print("Translation structure check failed:")
        for err in errors:
            print(f"- {err}")
        return 1

    print("Translation structure check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
