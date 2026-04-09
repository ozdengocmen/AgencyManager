Şimdi Yapılacaklar

Temas kapatma akışı kurulmalı.
Satışçı görüşme sonrası ya konuşarak ya da yazarak not girebilmeli; sistem bunu kayıt öncesi doğrulamalı ve yapılandırılmış çıktıya çevirmeli.

Manuel not validasyonu eklenmeli.
AI, notun anlamlı olup olmadığını kontrol etmeli; çok genel, aksiyonsuz, içeriksiz notlar reddedilmeli.

AI özetleme çıktısı şemalı hale getirilmeli.
Serbest metin yerine alanlara ayrılmış çıktı üretilmeli:

görüşme özeti
konuşulan ana başlıklar
alınan aksiyonlar
riskler
takip adımları
departman notları
Aksiyon kayıt modeli kurulmalı.
Girilen aksiyonlar sadece text olarak tutulmamalı; temas nedeni, kategori, hedef KPI, sorumlu, tarih gibi alanlarla kaydedilmeli.

Aksiyon kontrolü için ilk altyapı hazırlanmalı.
Aksiyonun yapılıp yapılmadığını mevcut raporlardan kontrol edecek bir evidence-check yapısı tasarlanmalı.

İleri Faz

Departmanlara not yönlendirme.
Teknik, tahsilat, hasar gibi notlar AI ile ayrıştırılıp belirli periyotlarda özet rapor haline getirilmeli.

Aksiyon-performans korelasyonu.
Geçmiş aksiyonlarla performans değişimleri ilişkilendirilmeli; hangi aksiyonların hangi durumda işe yaradığı bulunmalı.

Benzer durumlarda öneri motoru.
Sistem geçmiş başarılı örneklerden öğrenip satışçıya benzer acentelerde uygun aksiyon önermeli.

SPS puan öneri sistemi.
Satışçının mevcut KPI ve SPS durumuna göre hangi üretimlerle hangi puana yaklaşacağı hesaplanmalı.

Çeyrek sonu tahminleme.
Mevcut gidişata göre çeyreğin tahmini sonucu hesaplanıp satışçıya gösterilmeli.

Gerekli Veri Modelleri

ContactClosure
Temasın temel kaydı:
agency_id
salesperson_id
contact_date
contact_reason
input_mode (speech, manual)
raw_note
validated_note
summary
note_quality_score
validation_status
rejection_reasons
ActionItem
Görüşmeden çıkan aksiyon:
action_id
contact_id
agency_id
action_text
action_category
contact_reason
target_kpi
owner
due_date
status
completion_evidence
completed_at
DepartmentNote
Departman bazlı ayrılmış not:
contact_id
department_type
note_text
urgency
summary_bucket
routed_at
PerformanceSnapshot
Zaman bazlı performans görüntüsü:
agency_id
snapshot_date
renewal_rate
claims_ratio
production_metrics
sps_score
other_kpis
ActionOutcomeLink
Aksiyon ve performans etkisi ilişkisi:
action_id
observed_after_days
kpi_before
kpi_after
delta
correlation_score
effectiveness_label
AI Kullanılacak Noktalar

Speech-to-text çıktısını temizleyip anlamlı görüşme özetine dönüştürme.
Manuel notun kalite kontrolü.
Not içinden aksiyon, risk, takip maddesi çıkarma.
Aksiyonları tema ve temas nedenine göre sınıflandırma.
Departmanlara uygun not ayrıştırma.
Raporlardan aksiyonun yapıldığına dair semantik kanıt arama.
Geçmiş başarılı örneklere göre öneri cümlesi üretme.
SPS/KPI verilerini kullanıcıya anlaşılır öneriye dönüştürme.
AI Kullanılmaması Gereken Noktalar

KPI hesaplama.
SPS puan hesabı.
Korelasyon skoru üretiminin ana mantığı.
Çeyrek sonu tahmini için temel matematiksel hesap.
Kayıt doğrulama için zorunlu sistem kuralları.
Yetki, audit ve kalıcı veri bütünlüğü kararları.
Bu alanlarda backend deterministic olmalı; AI yalnızca yorumlayıcı ve yardımcı katman olmalı.

Önerilen Faz Sırası

Temas kapatma notu + manuel not validasyonu
Yapılandırılmış aksiyon kayıtları
Aksiyon kontrol/evidence kontrolü
Departman not ayrıştırma ve raporlama
Aksiyon-performans ilişkilendirme
SPS öneri ve tahmin modülü
İstersen bir sonraki adımda bunu doğrudan teknik tasarıma çeviririm:

frontend ekranları
backend endpointleri
veritabanı tabloları
AI workflow adımları