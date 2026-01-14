TARGET_FILE = tor

LATEX_COMPILER = pdflatex

all: $(TARGET_FILE).pdf

$(TARGET_FILE).pdf: $(TARGET_FILE).tex
	$(LATEX_COMPILER) $(TARGET_FILE).tex
	$(LATEX_COMPILER) $(TARGET_FILE).tex
	# $(LATEX_COMPILER) $(TARGET_FILE).tex

clean:
	@echo "Удаление временных файлов LaTeX..."
	@rm -f *.aux *.log *.toc *.lot *.lof *.bbl *.blg *.out *.nav *.snm *.synctex.gz *.dvi *.ps

.PHONY: all clean view