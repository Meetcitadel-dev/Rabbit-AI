from app.services.data_loader import DataRepository
from app.services.insights import InsightEngine
from app.services.chat import ChatService


def build_engine() -> InsightEngine:
    repo = DataRepository()
    dataset = repo.bootstrap()
    return InsightEngine(dataset.frame)


def test_kpi_has_positive_sales():
    engine = build_engine()
    kpi = engine.kpis()
    assert kpi.total_sales > 0
    assert kpi.total_units > 0


def test_breakdown_respects_filters():
    engine = build_engine()
    data = engine.breakdown(by="region", region=["North America"])
    assert all(row["region"] == "North America" for row in data)


def test_anomalies_and_recommendations_support_filters():
    engine = build_engine()
    anomalies = engine.anomalies(region=["Europe"])
    recommendations = engine.recommendations(region=["Europe"])
    assert isinstance(anomalies, list)
    assert isinstance(recommendations, list)
    assert len(recommendations) > 0


def test_inventory_and_supply_metrics_exist():
    engine = build_engine()
    summary = engine.inventory_summary()
    supply = engine.supply_chain_summary()
    assert summary["total_inventory"] > 0
    assert supply["avg_lead_time"] > 0


def test_marketing_performance_campaigns():
    engine = build_engine()
    campaigns = engine.marketing_performance()
    assert len(campaigns) > 0
    assert "roi" in campaigns[0]


def test_chat_service_returns_history():
    engine = build_engine()
    chat = ChatService(engine)
    response = chat.ask("Which regions are leading?")
    assert "narrative" in response
    assert len(response["history"]) == 2

