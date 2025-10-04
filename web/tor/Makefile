TARGET_NAME = tor

SOURCE = $(wildcard *.tex) \
$(wildcard *.sty) \
$(wildcard ./bibtex/*.bib) \
$(wildcard *.cls) \
$(wildcard ./picture/*.eps)

all: pdf

ps: $(TARGET_NAME).ps

dvi: $(TARGET_NAME).dvi

pdf: $(TARGET_NAME).pdf

$(TARGET_NAME).dvi: $(SOURCE)
	latex $(TARGET_NAME).tex
	latex $(TARGET_NAME).tex

$(TARGET_NAME).ps: $(TARGET_NAME).dvi
	dvips -o $(TARGET_NAME).ps $(TARGET_NAME).dvi

$(TARGET_NAME).pdf: $(SOURCE) 
	pdflatex $(TARGET_NAME).tex
	pdflatex $(TARGET_NAME).tex

clean:
	rm -rf *.dvi *.toc *.log *.aux *.bbl *.blg *.idx *.ilg *.ind *.out *.brf *.snm *.nav *.pdf *.ps

.PHONY: all clean ps pdf dvi