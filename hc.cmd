@echo off
set PYTHONPATH=%CD%
python -m src.heady_project.heady_conductor %*
