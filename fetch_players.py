"""
Fenerbahçe transfer verilerini API-Football'dan çekip oyunun players.json
dosyasına dönüştürür.

Çalıştırma:
    pip install requests
    python fetch_players.py

API anahtarı ortam değişkeninde varsa otomatik kullanılır:
    Windows PowerShell:
        $env:API_FOOTBALL_KEY="ANAHTARIN"
        python fetch_players.py

Anahtar tanımlı değilse program güvenli biçimde terminalde sorar.
"""

from __future__ import annotations

import getpass
import json
import os
import time
import unicodedata
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path
from typing import Any

import requests

API_URL = "https://v3.football.api-sports.io"
FENERBAHCE_TEAM_ID = 611

# Ağustos 2026 itibarıyla son 10 sezon için başlangıç.
# Daha sonra değiştirmek istersen yalnızca bu sayıyı değiştir.
MIN_SEASON_START = 2016

OUTPUT_FILE = Path(__file__).with_name("players.json")
REVIEW_FILE = Path(__file__).with_name("players_review.json")
RAW_FILE = Path(__file__).with_name("transfers_raw.json")


def api_get(
    endpoint: str,
    api_key: str,
    params: dict[str, Any],
    max_retries: int = 5,
) -> dict[str, Any]:
    """429 ve geçici sunucu hatalarında artan beklemeyle tekrar dener."""
    headers = {"x-apisports-key": api_key}
    delay_seconds = 4

    for attempt in range(1, max_retries + 1):
        response = requests.get(
            f"{API_URL}/{endpoint}",
            headers=headers,
            params=params,
            timeout=30,
        )

        remaining_day = response.headers.get("x-ratelimit-requests-remaining")
        remaining_minute = response.headers.get("X-RateLimit-Remaining")
        if remaining_day is not None or remaining_minute is not None:
            print(
                "Kalan limit:",
                f"günlük={remaining_day or '?'}",
                f"dakikalık={remaining_minute or '?'}",
            )

        if response.status_code == 429:
            if attempt == max_retries:
                raise RuntimeError(
                    "API çok fazla istek hatası verdi (429). "
                    "Bir süre sonra tekrar çalıştır."
                )

            retry_after = response.headers.get("Retry-After")
            wait = int(retry_after) if retry_after and retry_after.isdigit() else delay_seconds
            print(f"429 alındı. {wait} saniye bekleniyor...")
            time.sleep(wait)
            delay_seconds *= 2
            continue

        if 500 <= response.status_code < 600:
            if attempt == max_retries:
                response.raise_for_status()
            print(f"Sunucu hatası ({response.status_code}). {delay_seconds} saniye bekleniyor...")
            time.sleep(delay_seconds)
            delay_seconds *= 2
            continue

        response.raise_for_status()
        payload = response.json()

        errors = payload.get("errors")
        if errors:
            raise RuntimeError(f"API hatası: {errors}")

        return payload

    raise RuntimeError("API isteği tamamlanamadı.")


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return datetime.strptime(value[:10], "%Y-%m-%d").date()
    except ValueError:
        return None


def season_from_date(transfer_date: date) -> str:
    """
    Temmuz ve sonrası yeni sezon kabul edilir.
    Örnek: 2023-07-01 -> 2023-24
           2024-01-10 -> 2023-24
    """
    start_year = transfer_date.year if transfer_date.month >= 7 else transfer_date.year - 1
    return f"{start_year}-{str(start_year + 1)[-2:]}"


def normalize_name(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return "".join(ch.lower() for ch in value if ch.isalnum())


def aliases_for_club(club_name: str | None) -> list[str]:
    """Sık kullanılan birkaç otomatik alternatif üretir."""
    if not club_name:
        return []

    aliases: set[str] = set()
    replacements = {
        " FC": "",
        " CF": "",
        " SK": "",
        " FK": "",
        " AŞ": "",
        " A.Ş.": "",
    }

    for suffix, replacement in replacements.items():
        if club_name.endswith(suffix):
            shortened = club_name[: -len(suffix)] + replacement
            if shortened and shortened != club_name:
                aliases.add(shortened.strip())

    manual_aliases = {
        "Manchester United": ["Man United", "Manchester Utd", "Man Utd"],
        "Internazionale": ["Inter", "Inter Milan", "FC Internazionale"],
        "Inter": ["Inter Milan", "Internazionale", "FC Internazionale"],
        "İstanbul Başakşehir": ["Başakşehir", "Istanbul Basaksehir"],
        "Paris Saint Germain": ["PSG", "Paris Saint-Germain"],
        "Paris Saint-Germain": ["PSG", "Paris Saint Germain"],
        "Olympique Lyonnais": ["Lyon", "Olympique Lyon"],
        "Çaykur Rizespor": ["Rizespor", "Caykur Rizespor"],
        "Al-Nassr": ["Al Nassr"],
        "Olympiakos Piraeus": ["Olympiacos", "Olympiakos"],
    }

    aliases.update(manual_aliases.get(club_name, []))
    aliases.discard(club_name)
    return sorted(aliases)


def extract_movements(api_items: list[dict[str, Any]]) -> dict[int, dict[str, Any]]:
    """
    API yanıtındaki oyuncu bazlı transferleri standart bir yapıya çevirir.
    """
    players: dict[int, dict[str, Any]] = {}

    for item in api_items:
        player = item.get("player") or {}
        player_id = player.get("id")
        player_name = player.get("name")

        if not player_id or not player_name:
            continue

        player_record = players.setdefault(
            int(player_id),
            {
                "id": int(player_id),
                "name": str(player_name),
                "movements": [],
            },
        )

        for transfer in item.get("transfers") or []:
            teams = transfer.get("teams") or {}
            team_in = teams.get("in") or {}
            team_out = teams.get("out") or {}
            transfer_date = parse_date(transfer.get("date"))

            if transfer_date is None:
                continue

            player_record["movements"].append(
                {
                    "date": transfer_date,
                    "type": transfer.get("type"),
                    "in_id": team_in.get("id"),
                    "in_name": team_in.get("name"),
                    "out_id": team_out.get("id"),
                    "out_name": team_out.get("name"),
                }
            )

    for player in players.values():
        player["movements"].sort(key=lambda movement: movement["date"])

    return players


def create_game_records(players: dict[int, dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    playable: list[dict[str, Any]] = []
    review: list[dict[str, Any]] = []

    for player in players.values():
        movements = player["movements"]

        arrivals = [
            movement
            for movement in movements
            if movement["in_id"] == FENERBAHCE_TEAM_ID
            and movement["out_id"] != FENERBAHCE_TEAM_ID
            and int(season_from_date(movement["date"]).split("-")[0]) >= MIN_SEASON_START
        ]

        if not arrivals:
            continue

        # Aynı oyuncunun birden fazla gelişi varsa her geliş ayrı soru olmaması için
        # son 10 yıl içindeki ilk gelişi kullanılır.
        arrival = arrivals[0]

        departures = [
            movement
            for movement in movements
            if movement["out_id"] == FENERBAHCE_TEAM_ID
            and movement["in_id"] != FENERBAHCE_TEAM_ID
            and movement["date"] >= arrival["date"]
        ]
        departure = departures[0] if departures else None

        problems: list[str] = []
        if not arrival["out_name"]:
            problems.append("geldiği takım eksik")

        # Kiralıktan dönüş kayıtları bazen eski kulüp gibi görünür.
        transfer_type = str(arrival.get("type") or "")
        if "loan" in transfer_type.lower() or "kiralık" in transfer_type.lower():
            problems.append(f"geliş tipi kontrol edilmeli: {transfer_type}")

        record = {
    "id": player["id"],
    "name": player["name"],

    "image": (
        f"https://media.api-sports.io/football/players/"
        f"{player['id']}.png"
    ),

    "arrivalSeason": season_from_date(arrival["date"]),

    "arrivalClub": arrival["out_name"],
    "arrivalClubId": arrival["out_id"],

    "arrivalClubLogo": (
        f"https://media.api-sports.io/football/teams/"
        f"{arrival['out_id']}.png"
        if arrival["out_id"]
        else None
    ),

    "arrivalAliases": aliases_for_club(
        arrival["out_name"]
    ),

    "departureClub": (
        departure["in_name"]
        if departure
        else None
    ),

    "departureClubId": (
        departure["in_id"]
        if departure
        else None
    ),

    "departureClubLogo": (
        f"https://media.api-sports.io/football/teams/"
        f"{departure['in_id']}.png"
        if departure and departure["in_id"]
        else None
    ),

    "departureAliases": (
        aliases_for_club(departure["in_name"])
        if departure
        else []
    ),

    "arrivalDate": arrival["date"].isoformat(),

    "departureDate": (
        departure["date"].isoformat()
        if departure
        else None
    ),

    "transferType": arrival.get("type"),
}

        if departure and not departure["in_name"]:
            problems.append("gittiği takım eksik")

        if problems:
            review.append({**record, "reviewReasons": problems})
        else:
            playable.append(record)

    # Aynı isimli oyuncuların karışmaması için ID üzerinden benzersiz, isim üzerinden sıralı.
    playable.sort(key=lambda item: normalize_name(item["name"]))
    review.sort(key=lambda item: normalize_name(item["name"]))
    return playable, review


def main() -> None:
    api_key = os.getenv("API_FOOTBALL_KEY", "").strip()
    if not api_key:
        api_key = input("API-Football anahtarını gir: ").strip()

    if not api_key:
        raise SystemExit("API anahtarı girilmedi.")

    print("Fenerbahçe transferleri çekiliyor...")
    payload = api_get(
        "transfers",
        api_key,
        {"team": FENERBAHCE_TEAM_ID},
    )

    RAW_FILE.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2, default=str),
        encoding="utf-8",
    )

    response_items = payload.get("response") or []
    print(f"API'den {len(response_items)} oyuncu kaydı geldi.")

    players = extract_movements(response_items)
    playable, review = create_game_records(players)

    OUTPUT_FILE.write_text(
        json.dumps(playable, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    REVIEW_FILE.write_text(
        json.dumps(review, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print()
    print("Tamamlandı.")
    print(f"Oyuna eklenen oyuncu: {len(playable)}")
    print(f"Kontrol edilmesi gereken: {len(review)}")
    print(f"Oyun verisi: {OUTPUT_FILE.name}")
    print(f"Kontrol listesi: {REVIEW_FILE.name}")
    print(f"Ham API yanıtı: {RAW_FILE.name}")
    print()
    print("Şimdi siteyi Live Server ile yenileyebilirsin.")


if __name__ == "__main__":
    main()
