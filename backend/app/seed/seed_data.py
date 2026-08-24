import datetime
import random
import hashlib
import numpy as np
from sqlalchemy.orm import Session
from ..database.connection import engine, SessionLocal, Base
from ..database.models import (
    Airport,
    Airline,
    Route,
    Source,
    FareObservation,
    RouteIndex,
    NationalIndex,
    Anomaly,
    CollectionJob,
    DataQualityMetric,
    User,
    UserActivity,
)
from ..services.index_engine import calculate_representative_fare, aggregate_national_index
from ..services.auth_service import hash_password


def seed_database():
    print("Creating all database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        print("Seeding Indian Airport Hubs...")
        airports_data = [
            {"iata_code": "DEL", "name": "Indira Gandhi International Airport", "city": "Delhi", "state": "Delhi", "region": "North", "latitude": 28.5562, "longitude": 77.1000},
            {"iata_code": "BOM", "name": "Chhatrapati Shivaji Maharaj International Airport", "city": "Mumbai", "state": "Maharashtra", "region": "West", "latitude": 19.0896, "longitude": 72.8656},
            {"iata_code": "BLR", "name": "Kempegowda International Airport", "city": "Bengaluru", "state": "Karnataka", "region": "South", "latitude": 13.1986, "longitude": 77.7066},
            {"iata_code": "HYD", "name": "Rajiv Gandhi International Airport", "city": "Hyderabad", "state": "Telangana", "region": "South", "latitude": 17.2403, "longitude": 78.4294},
            {"iata_code": "MAA", "name": "Chennai International Airport", "city": "Chennai", "state": "Tamil Nadu", "region": "South", "latitude": 12.9941, "longitude": 80.1709},
            {"iata_code": "CCU", "name": "Netaji Subhash Chandra Bose International Airport", "city": "Kolkata", "state": "West Bengal", "region": "East", "latitude": 22.6547, "longitude": 88.4467},
            {"iata_code": "GOI", "name": "Dabolim Airport", "city": "Goa", "state": "Goa", "region": "West", "latitude": 15.3808, "longitude": 73.8314},
            {"iata_code": "AMD", "name": "Sardar Vallabhbhai Patel International Airport", "city": "Ahmedabad", "state": "Gujarat", "region": "West", "latitude": 23.0772, "longitude": 72.6347},
            {"iata_code": "COK", "name": "Cochin International Airport", "city": "Kochi", "state": "Kerala", "region": "South", "latitude": 10.1556, "longitude": 76.4019},
            {"iata_code": "PNQ", "name": "Pune International Airport", "city": "Pune", "state": "Maharashtra", "region": "West", "latitude": 18.5822, "longitude": 73.9197},
            {"iata_code": "GAU", "name": "Lokpriya Gopinath Bordoloi International Airport", "city": "Guwahati", "state": "Assam", "region": "Northeast", "latitude": 26.1061, "longitude": 91.5859},
            {"iata_code": "JAI", "name": "Jaipur International Airport", "city": "Jaipur", "state": "Rajasthan", "region": "North", "latitude": 26.8242, "longitude": 75.8122},
            {"iata_code": "LKO", "name": "Chaudhary Charan Singh International Airport", "city": "Lucknow", "state": "Uttar Pradesh", "region": "North", "latitude": 26.7606, "longitude": 80.8893},
            {"iata_code": "IXB", "name": "Bagdogra Airport", "city": "Siliguri", "state": "West Bengal", "region": "East", "latitude": 26.6812, "longitude": 88.3286},
        ]

        airport_objs = {}
        for ap in airports_data:
            obj = Airport(**ap)
            db.add(obj)
            airport_objs[ap["iata_code"]] = obj
        db.commit()

        print("Seeding Domestic Airlines...")
        airlines_data = [
            {"code": "6E", "name": "IndiGo", "market_share": 61.8},
            {"code": "AI", "name": "Air India", "market_share": 15.4},
            {"code": "QP", "name": "Akasa Air", "market_share": 5.2},
            {"code": "SG", "name": "SpiceJet", "market_share": 4.1},
            {"code": "IX", "name": "Air India Express", "market_share": 7.3},
            {"code": "AIX", "name": "AIX Connect", "market_share": 6.2},
        ]
        airline_objs = {}
        for al in airlines_data:
            obj = Airline(**al)
            db.add(obj)
            airline_objs[al["code"]] = obj
        db.commit()

        print("Seeding Ingestion Source Adapters...")
        sources_data = [
            {"name": "DGCA Reference Dataset", "source_type": "REFERENCE_FEED", "status": "OPERATIONAL", "reliability_score": 99.8},
            {"name": "GDS-Compatible Adapter", "source_type": "GDS_ADAPTER", "status": "OPERATIONAL", "reliability_score": 99.2},
            {"name": "OTA Aggregator Adapter", "source_type": "OTA_ADAPTER", "status": "OPERATIONAL", "reliability_score": 97.9},
            {"name": "Compliant Public Collector", "source_type": "WEB_COLLECTOR", "status": "OPERATIONAL", "reliability_score": 96.5},
        ]
        source_objs = []
        now_utc = datetime.datetime.now(datetime.timezone.utc)
        for src in sources_data:
            obj = Source(**src, last_success=now_utc)
            db.add(obj)
            source_objs.append(obj)
        db.commit()

        print("Seeding Monitored Air Corridors (Exact 100.00% Basket Weight)...")
        # Route parameters: origin, destination, weight, base_period_fare, target_approx_current
        routes_data = [
            ("DEL", "BOM", 12.0, 4760.0, 5480.0),
            ("DEL", "BLR", 10.0, 5690.0, 6240.0),
            ("BOM", "BLR", 8.5, 4560.0, 4920.0),
            ("DEL", "HYD", 7.5, 5120.0, 5610.0),
            ("DEL", "MAA", 7.0, 5480.0, 5890.0),
            ("DEL", "CCU", 6.8, 4980.0, 5380.0),
            ("DEL", "GOI", 6.5, 5240.0, 6420.0),
            ("BOM", "GOI", 5.8, 3850.0, 4420.0),
            ("BOM", "HYD", 5.4, 4120.0, 4390.0),
            ("BLR", "HYD", 4.8, 3420.0, 3680.0),
            ("BLR", "MAA", 4.2, 2890.0, 3050.0),
            ("MAA", "HYD", 3.8, 3240.0, 3480.0),
            ("CCU", "DEL", 3.6, 4980.0, 5290.0),
            ("AMD", "DEL", 3.5, 3650.0, 3920.0),
            ("COK", "BLR", 3.2, 3120.0, 3340.0),
            ("PNQ", "DEL", 3.1, 4890.0, 5190.0),
            ("DEL", "GAU", 2.5, 6120.0, 6450.0),
            ("DEL", "JAI", 1.8, 2850.0, 2920.0),
        ]

        total_w = round(sum(x[2] for x in routes_data), 2)
        assert abs(total_w - 100.0) < 0.001, f"Route weights must sum to 100.0%, got {total_w}"

        route_objs = []
        for orig, dest, weight, base_fare, approx_curr in routes_data:
            orig_ap = airport_objs[orig]
            dest_ap = airport_objs[dest]
            r = Route(
                origin_airport_id=orig_ap.id,
                destination_airport_id=dest_ap.id,
                route_weight=weight,
                active=True
            )
            db.add(r)
            route_objs.append((r, base_fare, approx_curr, orig, dest))
        db.commit()

        print("Step 1: Synthesizing 18,900 Multi-source Fare Observations with Strict Arithmetic...")
        booking_windows_map = {
            "D-1": (1, 1.48, 0.08),
            "D-3": (3, 1.32, 0.07),
            "D-7": (7, 1.15, 0.06),
            "D-15": (15, 1.05, 0.05),
            "D-30": (30, 0.96, 0.05),
            "D-45": (45, 0.92, 0.04),
            "D-60": (60, 0.88, 0.04),
        }

        airlines_list = list(airline_objs.values())
        fare_obs_list = []
        np.random.seed(42)
        random.seed(42)

        for r, base_fare, approx_curr, orig, dest in route_objs:
            num_obs_per_route = 1050  # 18 * 1050 = 18,900 observations

            for _ in range(num_obs_per_route):
                window_key = random.choice(list(booking_windows_map.keys()))
                lead_days, curve_multiplier, window_volatility = booking_windows_map[window_key]

                al = random.choices(
                    airlines_list,
                    weights=[al.market_share for al in airlines_list]
                )[0]

                src = random.choice(source_objs)

                al_factor = 1.0
                if al.code == "6E":
                    al_factor = 0.98
                elif al.code == "AI":
                    al_factor = 1.04
                elif al.code == "QP":
                    al_factor = 0.95
                elif al.code == "SG":
                    al_factor = 0.99

                expected_fare = approx_curr * curve_multiplier * al_factor
                fare_noise = np.random.normal(1.0, window_volatility)
                target_fare = max(1950.0, round(expected_fare * fare_noise, 0))

                # True Payable Fare Normalization Decomposition:
                taxes = round(target_fare * 0.18 + 450.0, 2)
                fuel_surch = round(random.choice([350.0, 450.0, 550.0, 650.0]), 2)
                conv_fee = round(399.0 if "OTA" in src.name else 250.0, 2)
                mand_surch = round(random.choice([100.0, 150.0, 200.0]), 2)
                disc = round(random.choice([0.0, 0.0, 150.0, 250.0, 300.0]), 2)

                base = max(1200.0, round(target_fare - taxes, 2))
                raw_advertised_total = round(base + taxes + fuel_surch, 2)
                std_payable_fare = round(
                    base + taxes + conv_fee + fuel_surch + mand_surch - disc, 2
                )

                obs_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(
                    minutes=random.randint(5, 7200)
                )
                travel_d = (obs_time + datetime.timedelta(days=lead_days)).date()

                flight_num = f"{al.code}-{random.randint(101, 999)}"

                cabin = random.choices(["Economy", "Premium Economy", "Business"], weights=[92, 6, 2])[0]
                fare_family = random.choices(["Standard", "Saver", "Flexi", "Corporate"], weights=[65, 20, 10, 5])[0]

                q_score = round(random.uniform(96.5, 99.8), 1)

                fare_obs_list.append(
                    FareObservation(
                        source_id=src.id,
                        airline_id=al.id,
                        route_id=r.id,
                        flight_number=flight_num,
                        observation_timestamp=obs_time,
                        travel_date=travel_d,
                        booking_lead_days=lead_days,
                        booking_window=window_key,
                        cabin=cabin,
                        fare_family=fare_family,
                        base_fare=base,
                        taxes=taxes,
                        convenience_fee=conv_fee,
                        mandatory_surcharge=mand_surch,
                        fuel_surcharge=fuel_surch,
                        service_fee=0.0,
                        payment_fee=0.0,
                        mandatory_baggage_fee=0.0,
                        mandatory_seat_fee=0.0,
                        other_mandatory_charges=0.0,
                        discount=disc,
                        coupon_discount=0.0,
                        total_fare=raw_advertised_total,
                        standardized_payable_fare=std_payable_fare,
                        stops=0 if random.random() > 0.12 else 1,
                        baggage="15kg Check-in + 7kg Cabin",
                        refundable=fare_family in ["Flexi", "Corporate"],
                        currency="INR",
                        quality_score=q_score,
                        is_anomaly=False,
                        validation_status="VALID"
                    )
                )

        print(f"Bulk inserting {len(fare_obs_list)} fare observations...")
        db.bulk_save_objects(fare_obs_list)
        db.commit()

        print("Step 2: Injecting Benchmark Statistical Anomalies with Valid Arithmetic...")
        del_goi_route = [r for r, _, _, o, d in route_objs if o == "DEL" and d == "GOI"][0]
        del_bom_route = [r for r, _, _, o, d in route_objs if o == "DEL" and d == "BOM"][0]
        bom_blr_route = [r for r, _, _, o, d in route_objs if o == "BOM" and d == "BLR"][0]

        injected_anomalies = [
            (del_goi_route.id, 19850.0, "D-15", "Observed fare ₹19,850 significantly exceeds recent route distribution (₹5,200 – ₹7,800) for D-15 booking window.", 0.94),
            (del_bom_route.id, 24500.0, "D-30", "Observed fare ₹24,500 exceeds historical 99th percentile for D-30 economy class on DEL-BOM.", 0.98),
            (bom_blr_route.id, 1450.0, "D-1", "Observed fare ₹1,450 falls below mandatory airline fuel surcharge + statutory airport UDF threshold.", 0.91),
            (del_bom_route.id, 21200.0, "D-7", "Sudden tariff spike inconsistent with cross-source GDS feeds for flight AI-865.", 0.89),
        ]

        for r_id, fake_fare, window, reason, score in injected_anomalies:
            obs = db.query(FareObservation).filter(FareObservation.route_id == r_id, FareObservation.booking_window == window).first()
            if obs:
                anom_taxes = round(fake_fare * 0.18 + 450.0, 2)
                obs.taxes = anom_taxes
                obs.fuel_surcharge = 550.0
                obs.convenience_fee = 399.0
                obs.mandatory_surcharge = 150.0
                obs.discount = 0.0
                obs.base_fare = max(100.0, round(fake_fare - anom_taxes - obs.fuel_surcharge, 2))
                obs.total_fare = fake_fare
                obs.standardized_payable_fare = round(
                    obs.base_fare + obs.taxes + obs.convenience_fee + obs.fuel_surcharge + obs.mandatory_surcharge - obs.discount,
                    2
                )
                obs.is_anomaly = True
                obs.validation_status = "ANOMALY"
                obs.quality_score = 72.4

                anom = Anomaly(
                    fare_observation_id=obs.id,
                    anomaly_score=score,
                    detection_method="IsolationForest + IQR Hybrid",
                    reason=reason,
                    review_status="PENDING"
                )
                db.add(anom)
        db.commit()

        print("Step 3: Calculating Route Representative Fares Directly from Valid Standardized Observations...")
        today = datetime.date.today()
        route_calc_data = []

        for r, base_fare, _, orig, dest in route_objs:
            from ..services.data_service import apply_valid_observations_filter
            valid_obs = apply_valid_observations_filter(
                db.query(FareObservation).filter(FareObservation.route_id == r.id)
            ).all()

            valid_fares = [
                getattr(o, "standardized_payable_fare", None) or o.total_fare
                for o in valid_obs
            ]
            rep_fare = round(calculate_representative_fare(valid_fares, method="trimmed_mean"), 0)

            price_rel = round(rep_fare / base_fare, 4)
            rt_index = round(price_rel * 100.0, 2)
            contrib = round((r.route_weight / 100.0) * (rt_index - 100.0), 2)

            ri = RouteIndex(
                route_id=r.id,
                date=today,
                representative_fare=rep_fare,
                base_fare=base_fare,
                price_relative=price_rel,
                route_index=rt_index,
                route_weight=r.route_weight,
                contribution=contrib
            )
            db.add(ri)
            route_calc_data.append({
                "weight": r.route_weight,
                "route_index": rt_index,
                "origin_iata": orig,
                "destination_iata": dest
            })
        db.commit()

        # Step 4: Compute exact National Index from calculated route indices
        agg_result = aggregate_national_index(route_calc_data)
        latest_national_api = agg_result["national_index"]
        print(f"Calculated Observation-Driven National Index (Single Source of Truth): {latest_national_api}")

        print("Step 5: Generating Historical 180-Day Series Ending on Exact Current Index...")
        history_days = 180
        trend = np.linspace(100.0, latest_national_api, history_days)
        noise = np.random.normal(0, 0.25, history_days)
        noise[-1] = 0.0  # Exact match on final day
        index_series = trend + noise

        for i in range(history_days):
            day_date = today - datetime.timedelta(days=(history_days - 1 - i))
            val = round(float(index_series[i]), 2)
            prev_val = float(index_series[i - 1]) if i > 0 else 100.0
            daily_chg = round(val - prev_val, 2)
            mom_chg = round(((val - float(index_series[max(0, i - 30)])) / float(index_series[max(0, i - 30)])) * 100, 2)

            q_score = round(98.0 + random.uniform(0.1, 0.8), 1)
            nat_idx = NationalIndex(
                date=day_date,
                index_value=val,
                daily_change=daily_chg,
                monthly_change=mom_chg,
                quality_score=q_score
            )
            db.add(nat_idx)
        db.commit()

        print("Step 6: Seeding Ingestion Collection Jobs & Dynamic Quality Score...")
        for src in source_objs:
            for job_idx in range(5):
                st = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=job_idx * 4 + random.randint(1, 3))
                job = CollectionJob(
                    source_id=src.id,
                    started_at=st,
                    completed_at=st + datetime.timedelta(seconds=random.randint(2, 6)),
                    records_collected=random.randint(350, 980),
                    status="SUCCESS" if job_idx > 0 or random.random() > 0.05 else "WARNING",
                    error_message=None
                )
                db.add(job)

        # 5-factor composite quality formula: 0.30*C + 0.25*F + 0.20*S + 0.15*A + 0.10*K
        completeness = 99.2
        freshness = 98.8
        schema_val = 99.9
        src_agree = 97.4
        consistency = 98.0
        calculated_quality = round(
            0.30 * completeness +
            0.25 * freshness +
            0.20 * schema_val +
            0.15 * src_agree +
            0.10 * consistency,
            1
        )

        total_obs_count = db.query(FareObservation).count()
        anom_count = db.query(FareObservation).filter(FareObservation.validation_status == "ANOMALY").count()
        anom_rate = round((anom_count / total_obs_count) * 100.0, 2) if total_obs_count > 0 else 0.0

        dq_metrics = DataQualityMetric(
            timestamp=datetime.datetime.now(datetime.timezone.utc),
            completeness=completeness,
            freshness=freshness,
            schema_validity=schema_val,
            source_agreement=src_agree,
            anomaly_rate=anom_rate,
            overall_score=calculated_quality
        )
        db.add(dq_metrics)
        db.commit()

        print("Seeding Official MoSPI Personas & RBAC Accounts...")
        users_data = [
            {
                "username": "officer.mospi",
                "email": "rajesh.sharma@mospi.gov.in",
                "full_name": "Dr. Rajesh Sharma",
                "role": "STATISTICAL_OFFICER",
                "designation": "Senior Statistical Officer (MoSPI)",
                "department": "Price Statistics Division (PSD)",
                "hashed_password": hash_password("MoSPI@2026"),
                "is_active": True,
                "avatar_initials": "RS",
                "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=120),
                "last_login": datetime.datetime.utcnow() - datetime.timedelta(minutes=14),
            },
            {
                "username": "advisor.economic",
                "email": "arvind.subramanian@mospi.gov.in",
                "full_name": "Dr. Arvind Subramanian",
                "role": "ECONOMIC_ADVISOR",
                "designation": "Chief Economic Advisor & Director",
                "department": "National Accounts & Macro Modeling Division",
                "hashed_password": hash_password("MoSPI@2026"),
                "is_active": True,
                "avatar_initials": "AS",
                "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=180),
                "last_login": datetime.datetime.utcnow() - datetime.timedelta(hours=2),
            },
            {
                "username": "engineer.data",
                "email": "priya.venkat@mospi.gov.in",
                "full_name": "Priya Venkat",
                "role": "DATA_ENGINEER",
                "designation": "Lead Data Pipeline Architect",
                "department": "DGCA Data Interface & Ingestion Team",
                "hashed_password": hash_password("MoSPI@2026"),
                "is_active": True,
                "avatar_initials": "PV",
                "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=90),
                "last_login": datetime.datetime.utcnow() - datetime.timedelta(minutes=32),
            },
            {
                "username": "admin.system",
                "email": "amitabh.kant@mospi.gov.in",
                "full_name": "Amitabh Kant",
                "role": "SYSTEM_ADMIN",
                "designation": "Principal System Administrator",
                "department": "Statistical IT Infrastructure & Security Cell",
                "hashed_password": hash_password("MoSPI@2026"),
                "is_active": True,
                "avatar_initials": "AK",
                "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=365),
                "last_login": datetime.datetime.utcnow() - datetime.timedelta(minutes=5),
            },
            {
                "username": "analyst.aviation",
                "email": "ananya.roy@mospi.gov.in",
                "full_name": "Ananya Roy",
                "role": "STATISTICAL_OFFICER",
                "designation": "Junior Statistical Analyst",
                "department": "Regional Airfare Price Bureau",
                "hashed_password": hash_password("MoSPI@2026"),
                "is_active": True,
                "avatar_initials": "AR",
                "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=45),
                "last_login": datetime.datetime.utcnow() - datetime.timedelta(days=1),
            },
        ]

        user_objs = []
        for u in users_data:
            user_obj = User(**u)
            db.add(user_obj)
            user_objs.append(user_obj)
        db.commit()

        print("Seeding Initial User Activity & Audit Trails...")
        sample_activities = [
            (user_objs[0].id, "INDEX_VALIDATION_COMPLETED", "INDEX_ENGINE", "Verified 10%-90% trimmed mean representative fare across 18 DGCA corridors."),
            (user_objs[1].id, "MACRO_CPI_SIMULATION_RUN", "CPI_SIMULATOR", "Simulated 5.2% ATF fuel escalation pass-through into Headline CPI (Transport +0.412 bps)."),
            (user_objs[2].id, "GDS_ADAPTER_CALIBRATION", "DATA_MONITOR", "Calibrated statutory rate limits for Amadeus GDS and EaseMyTrip aggregator feeds."),
            (user_objs[3].id, "SECURITY_ROSTER_AUDITED", "USER_MANAGEMENT", "Confirmed multi-factor authentication compliance across MoSPI statistical staff accounts."),
            (user_objs[0].id, "ANOMALY_TRIAGE_RESOLVED", "DATA_QUALITY", "Confirmed IsolationForest anomaly #1042 (Holiday peak fare exclusion on DEL-GOI)."),
        ]

        for uid, act, mod, det in sample_activities:
            act_entry = UserActivity(
                user_id=uid,
                action=act,
                module=mod,
                details=det,
                ip_address="10.24.1.18",
                status="SUCCESS",
                timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=random.randint(1, 24)),
            )
            db.add(act_entry)
        db.commit()

        print(f"Database Seed completed successfully! Total Observations: {total_obs_count}, Quality Score: {calculated_quality}%, National Index: {latest_national_api}")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
