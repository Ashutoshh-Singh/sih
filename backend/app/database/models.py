import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    Date,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from .connection import Base


class Airport(Base):
    __tablename__ = "airports"

    id = Column(Integer, primary_key=True, index=True)
    iata_code = Column(String(3), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    region = Column(String(50), nullable=False)  # North, South, West, East, Central, Northeast
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    origin_routes = relationship("Route", foreign_keys="Route.origin_airport_id", back_populates="origin_airport")
    destination_routes = relationship("Route", foreign_keys="Route.destination_airport_id", back_populates="destination_airport")


class Airline(Base):
    __tablename__ = "airlines"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(3), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    market_share = Column(Float, default=0.0)

    observations = relationship("FareObservation", back_populates="airline")


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    origin_airport_id = Column(Integer, ForeignKey("airports.id"), nullable=False)
    destination_airport_id = Column(Integer, ForeignKey("airports.id"), nullable=False)
    route_weight = Column(Float, nullable=False, default=1.0)
    active = Column(Boolean, default=True)

    origin_airport = relationship("Airport", foreign_keys=[origin_airport_id], back_populates="origin_routes")
    destination_airport = relationship("Airport", foreign_keys=[destination_airport_id], back_populates="destination_routes")
    observations = relationship("FareObservation", back_populates="route")
    route_indices = relationship("RouteIndex", back_populates="route")


class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    source_type = Column(String(50), nullable=False)  # OFFICIAL_API, LICENSED_GDS, OTA_AGGREGATOR, COMPLIANT_COLLECTOR
    status = Column(String(50), default="OPERATIONAL")  # OPERATIONAL, DELAYED, FAILED, MAINTENANCE, DEMO
    reliability_score = Column(Float, default=99.0)
    last_success = Column(DateTime, default=datetime.datetime.utcnow)

    observations = relationship("FareObservation", back_populates="source")
    jobs = relationship("CollectionJob", back_populates="source")


class FareObservation(Base):
    __tablename__ = "fare_observations"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    airline_id = Column(Integer, ForeignKey("airlines.id"), nullable=False)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    flight_number = Column(String(20), nullable=False)
    observation_timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    travel_date = Column(Date, nullable=False, index=True)
    booking_lead_days = Column(Integer, nullable=False)
    booking_window = Column(String(10), nullable=False)  # D-1, D-3, D-7, D-15, D-30, D-45, D-60
    cabin = Column(String(30), default="Economy")  # Economy, Premium Economy, Business
    fare_family = Column(String(50), default="Standard")  # Standard, Saver, Flexi, Corporate
    base_fare = Column(Float, nullable=False)
    taxes = Column(Float, nullable=False)
    convenience_fee = Column(Float, default=0.0, nullable=False)
    mandatory_surcharge = Column(Float, default=0.0, nullable=False)
    fuel_surcharge = Column(Float, default=0.0, nullable=False)
    service_fee = Column(Float, default=0.0, nullable=False)
    payment_fee = Column(Float, default=0.0, nullable=False)
    mandatory_baggage_fee = Column(Float, default=0.0, nullable=False)
    mandatory_seat_fee = Column(Float, default=0.0, nullable=False)
    other_mandatory_charges = Column(Float, default=0.0, nullable=False)
    discount = Column(Float, default=0.0, nullable=False)
    coupon_discount = Column(Float, default=0.0, nullable=False)
    total_fare = Column(Float, nullable=False, index=True)
    standardized_payable_fare = Column(Float, nullable=False, index=True)
    stops = Column(Integer, default=0)
    baggage = Column(String(50), default="15kg Check-in + 7kg Cabin")
    refundable = Column(Boolean, default=False)
    currency = Column(String(5), default="INR")
    quality_score = Column(Float, default=98.5)
    is_anomaly = Column(Boolean, default=False, index=True)
    validation_status = Column(String(30), default="VALID")  # VALID, WARNING, ANOMALY, INCOMPLETE

    source = relationship("Source", back_populates="observations")
    airline = relationship("Airline", back_populates="observations")
    route = relationship("Route", back_populates="observations")
    anomaly = relationship("Anomaly", back_populates="observation", uselist=False)


class RouteIndex(Base):
    __tablename__ = "route_indices"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    representative_fare = Column(Float, nullable=False)
    base_fare = Column(Float, nullable=False)
    price_relative = Column(Float, nullable=False)
    route_index = Column(Float, nullable=False)
    route_weight = Column(Float, nullable=False)
    contribution = Column(Float, default=0.0)

    route = relationship("Route", back_populates="route_indices")


class NationalIndex(Base):
    __tablename__ = "national_indices"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, nullable=False, index=True)
    index_value = Column(Float, nullable=False)
    daily_change = Column(Float, default=0.0)
    monthly_change = Column(Float, default=0.0)
    quality_score = Column(Float, default=98.4)


class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    fare_observation_id = Column(Integer, ForeignKey("fare_observations.id"), nullable=False)
    anomaly_score = Column(Float, nullable=False)
    detection_method = Column(String(50), default="IsolationForest + IQR")
    reason = Column(Text, nullable=False)
    review_status = Column(String(30), default="PENDING")  # PENDING, ACCEPTED, REJECTED

    observation = relationship("FareObservation", back_populates="anomaly")


class CollectionJob(Base):
    __tablename__ = "collection_jobs"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    records_collected = Column(Integer, default=0)
    status = Column(String(30), default="SUCCESS")  # SUCCESS, RUNNING, FAILED, WARNING
    error_message = Column(Text, nullable=True)

    source = relationship("Source", back_populates="jobs")


class DataQualityMetric(Base):
    __tablename__ = "data_quality_metrics"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    completeness = Column(Float, default=99.2)
    freshness = Column(Float, default=98.8)
    schema_validity = Column(Float, default=99.9)
    source_agreement = Column(Float, default=97.4)
    anomaly_rate = Column(Float, default=1.1)
    overall_score = Column(Float, default=98.4)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False, default="STATISTICAL_OFFICER")
    # Roles: STATISTICAL_OFFICER, ECONOMIC_ADVISOR, DATA_ENGINEER, SYSTEM_ADMIN
    designation = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False, default="Price Statistics Division (PSD)")
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    avatar_initials = Column(String(10), nullable=True)
    last_login = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    activities = relationship("UserActivity", back_populates="user", cascade="all, delete-orphan")


class UserActivity(Base):
    __tablename__ = "user_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    module = Column(String(50), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), default="10.24.1.18")
    status = Column(String(30), default="SUCCESS")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="activities")

