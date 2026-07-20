import fitz
import unicodedata
import re
from wordfreq import zipf_frequency


class reader:

    def __init__(self, path):
        self.path = path
    def fix_broken_words(self, text):

        tokens = text.split()
        result = []

        i = 0

        while i < len(tokens):

            best = tokens[i]
            best_score = zipf_frequency(best, "fa")

            # Try merging 2 tokens
            if i + 1 < len(tokens):

                merged = tokens[i] + tokens[i + 1]
                score = zipf_frequency(merged, "fa")

                if score > best_score:
                    best = merged
                    best_score = score
                    skip = 2
                else:
                    skip = 1

            else:
                skip = 1

            # Try merging 3 tokens
            if i + 2 < len(tokens):

                merged = (
                    tokens[i]
                    + tokens[i + 1]
                    + tokens[i + 2]
                )

                score = zipf_frequency(merged, "fa")

                if score > best_score:
                    best = merged
                    best_score = score
                    skip = 3

            result.append(best)
            i += skip

        return " ".join(result)
    
    def normalize_persian(self, text):

        text = unicodedata.normalize("NFKC", text)

        text = text.replace("ي", "ی")
        text = text.replace("ى", "ی")
        text = text.replace("ك", "ک")

        text = re.sub(r"[ \t]+", " ", text)

        text = re.sub(
            r"\s+([،؛.!؟])",
            r"\1",
            text
        )

        return text.strip()

    def read(self):

        pages = []

        doc = fitz.open(self.path)

        for page_number, page in enumerate(doc, start=1):

            data = page.get_text("rawdict")

            chars = []

            for block in data["blocks"]:

                if "lines" not in block:
                    continue

                for line in block["lines"]:

                    for span in line["spans"]:

                        if "chars" not in span:
                            continue

                        for char in span["chars"]:

                            c = char["c"]
                            bbox = char["bbox"]

                            x0, y0, x1, y1 = bbox

                            chars.append({
                                "char": c,
                                "x0": x0,
                                "x1": x1,
                                "y": y0,
                                "size": span["size"]
                            })

            # -------------------------
            # group chars into lines
            # -------------------------

            lines = []

            for char in chars:

                added = False

                for line in lines:

                    if abs(char["y"] - line["y"]) < 3:

                        line["chars"].append(char)
                        added = True
                        break

                if not added:

                    lines.append({
                        "y": char["y"],
                        "chars": [char]
                    })

            # -------------------------
            # sort lines vertically
            # -------------------------

            lines.sort(key=lambda x: x["y"])

            page_lines = []

            for line in lines:

                line_chars = line["chars"]

                # فارسی: راست به چپ
                line_chars.sort(
                    key=lambda x: x["x0"],
                    reverse=True
                )

                words = []
                current_word = ""

                previous_char = None

                for char in line_chars:

                    current_char = char["char"]

                    if previous_char is not None:

                        gap = (
                            previous_char["x0"]
                            - char["x1"]
                        )

                        # فاصله بین کلمات
                        if gap > 3:

                            if current_word:

                                words.append(
                                    current_word
                                )

                                current_word = ""

                    current_word += current_char

                    previous_char = char

                if current_word:

                    words.append(current_word)

                line_text = " ".join(words)

                page_lines.append(line_text)

            page_text = "\n".join(page_lines)

            page_text = self.normalize_persian(page_text)
            page_text = self.fix_broken_words(page_text)

            if page_text:

                pages.append({
                    "page": page_number,
                    "text": page_text
                })
 
        return pages