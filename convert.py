#!/usr/bin/python

import datetime
import pathlib
import argparse

from uuid import uuid5, NAMESPACE_OID as ns_oid
import glob
import os

import yaml, json

import config


def str_to_dt(date_str):
    return datetime.datetime.strptime(
        date_str, "%Y-%m-%d"
    ).date()


def read_json(fname):
    with open(fname, "r") as _f:
        result = {
            "file": json.load(_f)
        }
        result["uuid"] = str(uuid5(ns_oid, str(result["file"])))
        result["name"] = os.path.basename(os.path.splitext(fname)[0])
        return result


def read_json_dir(dirname=None):
    result = []
    if dirname:
        alias = '/%s' % dirname
    else:
        dirname = ''
    json_dir = "%s%s" % (config.input_dir, dirname)
    files = glob.glob("%s/*.json" % json_dir)
    for fname in files:
        data = read_json(fname)
        result.append(data)

    return result


def read_yaml(fname):
    with open(fname, "r") as _f:
        result = {
            "file": yaml.load(_f, Loader=yaml.FullLoader)
        }
        result["uuid"] = str(uuid5(ns_oid, str(result["file"])))
        # for debug:
        result["name"] = fname
        return result


def read_yaml_dir(subdir):
    result = []
    yaml_dir = "%s/%s" % (config.input_dir, subdir)
    files = glob.glob("%s/*.yaml" % yaml_dir)
    limit = 32
    i = 0
    for fname in files:
        if limit and i < limit:
            data = read_yaml(fname)
            result.append(data)
            i += 1
        else:
            break

    return result


def save_yaml(uuid, data):
    file_path = config.output_dir
    #file_path = "%s/%s" % (config.output_dir, dname)
    pathlib.Path(file_path).mkdir(parents=True, exist_ok=True)
    file = open("%s/%s.yaml" % (file_path, uuid), "w")
    file.write(yaml.dump(data, allow_unicode=True))
    file.close()


def get_uuid_by_code(items, code):
    code = code.replace(".", "_")
    for elm in items:
        if elm["name"] == code:
            return elm["uuid"]


def convert_codes():
    source = read_json_dir()

    items = []
    for elm in source:

        code = elm["file"].get("code", None)

        fieldcode = elm["file"].get("fieldcode", None)
        groupcode = elm["file"].get("groupcode", None)
        subgroupcode = elm["file"].get("subgroupcode", None)

        if code:
            elm["file"]["code"] = str(code)

        if fieldcode:
            elm["file"]["fieldcode"] = str(fieldcode)

        if groupcode:
            elm["file"]["groupcode"] = str(groupcode)

        if subgroupcode:
            elm["file"]["subgroupcode"] = str(subgroupcode)

        description = elm["file"].get("description", None)
        context = elm["file"].get("@context", None)
        description_full = elm["file"].get("descriptionFull", None)
        
        notes = elm["file"].get("notes", None)

        if notes:
            elm["file"].pop("notes")

        if not description:
            elm["file"]["description"] = ""

        if not description_full:
            elm["file"]["descriptionFull"] = ""

        #if notes:
        #    i = 0
        #    for note in notes:
        #        if note.get("ics-code", False):
        #            notes[i]["ics-code"] = str(note["ics-code"])
        #        i += 1
        #    elm["file"]["notes"] = notes
        #    print(notes)


        filtred_notes = []
        relations = []

        elm["file"]["relationships"] = []

        if notes:
            i = 0

            for note in notes:
                if note.get("ics-code", False):
                    ics_code = str(note["ics-code"])
                    _ref = get_uuid_by_code(source, ics_code)

                    #print(note["text"]," = ", elm["file"]["description"])
                    #if not _ref:
                    #    print(ics_code)

                    relations.append({
                        "type": "related",
                        "to": _ref,
                        "text": note["text"].replace('{ics-code}', ics_code)
                    })
                elif note.get("text", False):
                    filtred_notes.append(note["text"])

                i += 1

            elm["file"]["relationships"] = relations
            elm["file"]["notes"] = filtred_notes
            #print(relations)


        elm["file"]["context"] = elm["file"].pop("@context")

        ics_codes = {
            "id": elm["uuid"],
            "dateAccepted": str_to_dt("2018-11-17"),
            "status": "valid",
            "data": elm["file"]
        }

        save_yaml(elm["uuid"], ics_codes)


if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description="Convert data from ICS code data to new yaml format."
    )

    convert_codes()
