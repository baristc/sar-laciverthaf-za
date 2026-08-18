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

## Çevrimiçi oyun

Siteyi HTTPS üzerinden açan oyunculardan biri **Oda oluştur** düğmesine basar ve ekrandaki altı haneli kodu rakibine gönderir. Diğer oyuncu kendi bilgisayarında aynı siteyi açıp adını ve oda kodunu yazarak **Odaya katıl** düğmesine basar.

Çevrimiçi bağlantı PeerJS/WebRTC üzerinden iki tarayıcı arasında kurulur. Bu nedenle iki oyuncunun da internet bağlantısı olmalı ve sayfa `file://` yerine GitHub Pages veya başka bir HTTPS adresinden açılmalıdır.

## Oyun verisi kuralları

- Ayrılış kaydı olmayan güncel oyuncular için doğru cevap `Fenerbahçe` veya `Hâlâ Fenerbahçe'de` gibi açık bir eşdeğerdir; otomatik puan verilmez.
- Aynı futbolcunun her Fenerbahçe gelişi ayrı dönem kaydıdır.
- Geliş ve ayrılış tarih alanları önceki ISO biçiminde tutulur.
- Sezon listesi `2026-27` sezonunu da kapsar.
## Tek kişilik mod

Ana ekrandaki üst sekmelerden **Tek Başına** seçilir. Bu modda tur sınırı yoktur. Her 5 soruluk kontrol noktasında belirlenen puan hedefi aşılmalıdır: ilk hedef 50 puandır; sonraki hedefler 10'ar puan artar ve 100 puanda sabitlenir. Hedefin altında kalan oyuncu elenir. Toplam puan ve en yüksek skor aynı tarayıcıda saklanır.
