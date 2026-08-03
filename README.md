# Fener Transfer Düellosu

## Siteyi çalıştırma

1. Klasörü VS Code ile aç.
2. `index.html` dosyasına sağ tıkla.
3. **Open with Live Server** seçeneğine bas.

## API'den oyuncu verisi çekme

### 1. Python'u kontrol et

VS Code terminalinde:

```bash
python --version
```

### 2. Gerekli paketi kur

```bash
pip install -r requirements.txt
```

`pip` çalışmazsa:

```bash
python -m pip install -r requirements.txt
```

### 3. Veri çekme kodunu çalıştır

```bash
python fetch_players.py
```

Program API anahtarını terminalde sorar. Yazdığın anahtar ekranda görünmez; bu normaldir.

### 4. Oluşan dosyalar

- `players.json`: Oyunun doğrudan kullandığı temiz kayıtlar.
- `players_review.json`: Eksik veya kontrol edilmesi gereken kayıtlar.
- `transfers_raw.json`: API'den gelen ham yanıt.

Kod yalnızca bir ana transfer isteği yaptığı için, sezon sezon oyuncu sorgulamaya göre limit dostudur. 429 alınırsa artan sürelerle yeniden dener.

## Veri kontrolü

Transfer API'leri kiralık dönüş, altyapı geçişi veya aynı oyuncunun ikinci kez gelişi gibi kayıtları her zaman oyun mantığına tam uygun yorumlamayabilir. Bu nedenle siteyi yayınlamadan önce özellikle `players_review.json` dosyasını kontrol et.

## Fotoğraflar

Oyuncu fotoğrafları oyuncu ID'sinden şu biçimde oluşturulur:

```text
https://media.api-sports.io/football/players/PLAYER_ID.png
```
