#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from fastapi import APIRouter, HTTPException
import math
from sqlalchemy import text
from db.database import SessionLocal

api_router = APIRouter(prefix="/api/v0")

gpc_quality_data = "low"

gas_to_gwp100 = {"co2": 1, "ch4": 29.8, "n2o": 273}
gas_to_gwp20 = {"co2": 1, "ch4": 82.5, "n2o": 273}

def not_nan_or_none(value):
    """return true if value is not nan, none, or empty"""
    if isinstance(value, float | int):
        return not math.isnan(value)
    return value is not None and value != ""


# Extract the data by locode, year and sector/subsector
def db_query(source_name, country_code, year, GPC_refno):
    rows = []
    with SessionLocal() as session:
        query = text(
            """
            SELECT lower(gas_name) as gas_name, sum(emissions_value::float) as emissions_value
            FROM country_code
            WHERE source_name = :source_name
            AND "GPC_refno" = :GPC_refno
            AND country_code = :country_code
            AND year = :year
            GROUP BY gas_name;
            """
        )
        params = {"source_name": source_name, "country_code": country_code, "year": year, "GPC_refno": GPC_refno}
        result = session.execute(query, params)
        rows = [row._asdict() for row in result]

    return rows


@api_router.get("/source/{source_name}/country/{country_code}/{year}/{GPC_refno}")
def get_emissions_by_country_and_year(source_name: str, country_code: str, year: str, GPC_refno: str):

    records = db_query(source_name, country_code, year, GPC_refno)

    if not records:
        raise HTTPException(status_code=404, detail="No data available")

    totals = {
        "totals": {
            "emissions": {
                "co2_mass": "0",
                "co2_co2eq": "0",
                "ch4_mass": "0",
                "ch4_co2eq_100yr": "0",
                "ch4_co2eq_20yr": "0",
                "n2o_mass": "0",
                "n2o_co2eq_100yr": "0",
                "n2o_co2eq_20yr": "0",
                "gpc_quality": str(gpc_quality_data),
            }
        }
    }

    emissions = totals["totals"]["emissions"]

    co2e = list(filter(lambda x: x["gas_name"] == "co2e", records))

    if (len(co2e) > 0):
        val = str(int(round(float(co2e[0]["emissions_value"]))))
        emissions["co2eq_100yr"] = val
        emissions["co2eq_20yr"] = val

    co2 = list(filter(lambda x: x["gas_name"] == "co2", records))

    if (len(co2) > 0):
        val = str(int(round(float(co2[0]["emissions_value"]))))
        emissions["co2_mass"] = val
        emissions["co2_co2eq"] = val

    ch4 = list(filter(lambda x: x["gas_name"] == "ch4", records))

    if (len(ch4) > 0):
        val = str(int(round(float(ch4[0]["emissions_value"]))))
        emissions["ch4_mass"] = val
        emissions["ch4_co2eq_100yr"] = str(int(round(float(ch4[0]["emissions_value"] * gas_to_gwp100["ch4"]))))
        emissions["ch4_co2eq_20yr"] = str(int(round(float(ch4[0]["emissions_value"] * gas_to_gwp20["ch4"]))))

    n2o = list(filter(lambda x: x["gas_name"] == "n2o", records))

    if (len(n2o) > 0):
        val = str(int(round(float(n2o[0]["emissions_value"]))))
        emissions["n2o_mass"] = val
        emissions["n2o_co2eq_100yr"] = str(int(round(float(n2o[0]["emissions_value"] * gas_to_gwp100["n2o"]))))
        emissions["n2o_co2eq_20yr"] = str(int(round(float(n2o[0]["emissions_value"] * gas_to_gwp20["n2o"]))))

    return {**totals}