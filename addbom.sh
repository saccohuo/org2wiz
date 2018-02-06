# pyinstaller --onefile addbom.py
pyinstaller --onefile addbom.spec
cp -f -p ./dist/addbom.exe ./
rm -rf ./dist/
rm -rf ./__pycache__/
rm -rf ./build/
