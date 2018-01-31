import sys
from codecs import BOM_UTF8, BOM_UTF16_BE, BOM_UTF16_LE, BOM_UTF32_BE, BOM_UTF32_LE
import os.path
import fileinput
import shutil

def main(argv):
    filename = argv[0]
    curfilename = argv[1]
    # print(type(argv))
    # print(type(argv[0]))
    # filename = 'blank.org'
    isgbk = False
    BOMS = (
        (BOM_UTF8, "UTF-8"),
        (BOM_UTF32_BE, "UTF-32-BE"),
        (BOM_UTF32_LE, "UTF-32-LE"),
        (BOM_UTF16_BE, "UTF-16-BE"),
        (BOM_UTF16_LE, "UTF-16-LE"),
    )

    with open(filename, 'rb') as f:
        datab = f.read()

    withbom = check_bom(datab,BOMS)

    shutil.copyfile(filename,curfilename)

    if withbom == []:
        try:
            data = open(filename, encoding='UTF-8').read()
            isgbk = False
        except UnicodeError:
            data = open(filename, encoding='GBK').read()
            isgbk = True
        if isgbk == False:
            procmsg = add_bom(filename,curfilename,BOM_UTF8)
            if procmsg == True:
                # print(curfilename)
                # no bom, utf-8, add bom
                sys.exit(1)
                return 1
            else:
                # no bom, utf-8, 'error in add_bom()'
                sys.exit(2)
                return 2
    # with bom
    sys.exit(0)
    return 0

def check_bom(data,BOMS):
    return [encoding for bom, encoding in BOMS if data.startswith(bom)]

def add_bom(fn, newfn, data_pretend):
    t = open(newfn, 'wb')
    idx = 0;
    with open(fn, 'rb') as f:
        for xline in f:
            idx = idx+1
            if idx == 1:
                t.write(data_pretend + xline)
            else:
                t.write(xline)
    t.close()
    return True

if __name__ == "__main__":
   main(sys.argv[1:])
