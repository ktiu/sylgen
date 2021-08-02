# Einleitung

Dieses Repo dient der kollaborativen Entwicklung, Bearbeitung, Ergänzung und Verbesserung des [Syllabus-Generators](https://ktiu.github.io/sylgen).

Im Folgenden wird beschrieben, wie jede\*r helfen kann, den Generator zu verbessern.

# Bugs und Verbesserungen

In den [Issues in diesem Repo](https://github.com/ktiu/sylgen/issues) können Sie Fehler melden oder Verbesserungsvorschläge einreichen.

# Daten ergänzen

Alle können mithelfen, fehlende Daten zu ergänzen.

## Universität hinzufügen

- Metadaten in `data/unis.yaml` hinzufügen
- Entsprechend benannten Ordner erstellen mit den folgenden Inhalten:
  - `template.docx`
  - `departments.yaml`
  - `terms.yaml`
- Dabei am besten den Ordner `unis/_template/` kopieren, umbenennen und anpassen.

## Institution hinzufügen

- Geht immer nur für eine Uni
- Im entsprechenden Uni-Ordner `departments.yaml` bearbeiten
- Beim Format am besten bei einer bestehenden Institution "abschreiben".

## Semestertermine hinzufügen

- Geht immer nur für eine Uni
- Im entsprechenden Uni-Ordner `terms.yaml` bearbeiten.
- Für das richtige Format an bestehenden Terminen orientieren.

## Anleitungen schreiben

- Diese Anleitungen sind dürftig und können gerne verbessert werden!
- Dazu die Datei `README.md` bearbeiten.
