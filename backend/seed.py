"""Seed the Gatabakana catalog. Run: cd /app/backend && python seed.py"""

import asyncio

from lib.db import db, ensure_indexes
from models.catalog import Product


def img(photo_id: str, w: int = 900) -> str:
    return f"https://images.unsplash.com/{photo_id}?q=85&w={w}&auto=format&fit=crop"


def clothing_sizes(base: int = 10) -> list[dict]:
    return [
        {"size": "PP", "stock": max(2, base // 2)},
        {"size": "P", "stock": base + 4},
        {"size": "M", "stock": base + 7},
        {"size": "G", "stock": base},
        {"size": "GG", "stock": max(2, base // 2)},
    ]


def swim_sizes() -> list[dict]:
    return [
        {"size": "P", "stock": 8},
        {"size": "M", "stock": 12},
        {"size": "G", "stock": 7},
    ]


CATEGORIES = [
    {"slug": "novidades", "name": "Novidades", "image": img("photo-1662532577856-e8ee8b138a8b"), "order": 1},
    {"slug": "vestidos", "name": "Vestidos", "image": img("photo-1568252542512-9fe8fe9c87bb"), "order": 2},
    {"slug": "blusas", "name": "Blusas & Croppeds", "image": img("photo-1609505848912-b7c3b8b4beda"), "order": 3},
    {"slug": "calcas", "name": "Calças & Jeans", "image": img("photo-1602293589930-45aad59ba3ab"), "order": 4},
    {"slug": "shorts-e-saias", "name": "Shorts & Saias", "image": img("photo-1721637286605-ae9be19d681f"), "order": 5},
    {"slug": "beachwear", "name": "Beachwear", "image": img("photo-1591901559829-ce65d7eaca0a"), "order": 6},
    {"slug": "conjuntos-e-casacos", "name": "Conjuntos & Casacos", "image": img("photo-1758900728131-32b8fa6fcda4"), "order": 7},
    {"slug": "outlet", "name": "Outlet 50% OFF", "image": img("photo-1601597565151-70c4020dc0e1"), "order": 8},
]

PRODUCTS: list[dict] = [
    dict(
        slug="vestido-longo-liocel-resort-chic-natural", name="VESTIDO LONGO LIOCEL RESORT CHIC NATURAL",
        reference="41410-309", category="vestidos", line="Glam", price=610.90, old_price=None,
        images=[img("photo-1779398645734-d79d3f06a96d"), img("photo-1662532577856-e8ee8b138a8b")],
        colors=[("Natural", "#E8DCC8"), ("Off White", "#F5F1EA")],
        description="Vestido longo em liocel com caimento fluido e respingos de sofisticação resort. A peça que traduz o chic catarinense para os momentos inesquecíveis.",
        composition="62% liocel, 36% viscosa, 2% elastano",
        mais_vendida=True, destaque=True,
    ),
    dict(
        slug="vestido-justo-canelado-eco-natural", name="VESTIDO JUSTO CANELADO ECO NATURAL",
        reference="41324-309", category="vestidos", line="Basic", price=446.90, old_price=None,
        images=[img("photo-1685278463760-cd2134ab9d8a"), img("photo-1779398645734-d79d3f06a96d")],
        colors=[("Off White", "#F5F1EA")],
        description="Malha canelada com modelagem justa que abraça as curvas. O básico atemporal que compõe looks infinitos.",
        composition="95% algodão orgânico, 5% elastano",
        mais_vendida=True,
    ),
    dict(
        slug="vestido-midi-floral-festival", name="VESTIDO MIDI FLORAL FESTIVAL",
        reference="41520-101", category="vestidos", line="Trendy", price=329.90, old_price=None,
        images=[img("photo-1646296142225-28436a93863a"), img("photo-1786865573414-44edcba97af0")],
        colors=[("Floral", "#C44837")],
        description="Estampa floral exclusiva da linha Trendy em modelagem midi leve. Do brunch ao pôr do sol, sempre poderosa.",
        composition="100% viscose",
        novidade=True, trends=True,
    ),
    dict(
        slug="vestido-longo-poa-vermelho-riviera", name="VESTIDO LONGO POÁ VERMELHO RIVIERA",
        reference="41521-102", category="vestidos", line="Glam", price=229.95, old_price=459.90,
        images=[img("photo-1786865573414-44edcba97af0"), img("photo-1786874228638-11b2d6aed176")],
        colors=[("Vermelho", "#B02A25")],
        description="Poá clássico em vermelho riviera com fenda lateral. Feito para ser a protagonista de qualquer verão.",
        composition="88% poliéster, 12% elastano",
        trends=True,
    ),
    dict(
        slug="vestido-midi-serenity-verde", name="VESTIDO MIDI SERENITY VERDE",
        reference="41522-103", category="vestidos", line="Trendy", price=399.90, old_price=None,
        images=[img("photo-1658060796818-9d2144c99975"), img("photo-1662532577856-e8ee8b138a8b")],
        colors=[("Verde", "#3E7A5E")],
        description="Tom verde serenity com deculação transpasse. Elegância fluida para os dias que pedem leveza.",
        composition="70% viscose, 30% linho",
        novidade=True,
    ),
    dict(
        slug="vestido-justo-boho-romantic-carvalho", name="VESTIDO JUSTO BOHO ROMANTIC CARVALHO",
        reference="40503-143", category="vestidos", line="Mais Gata", price=195.45, old_price=390.90,
        images=[img("photo-1666635213698-0ea75f64e79c"), img("photo-1581497396202-5645e76a3a8e")],
        colors=[("Carvalho", "#8B5E3C")],
        description="Espírito boho em tom carvalho com acabamentos românticos. A linha Mais Gata em sua expressão mais autêntica.",
        composition="55% linho, 45% viscose",
    ),
    dict(
        slug="blusa-antonella-off-white", name="BLUSA ANTONELLA OFF WHITE",
        reference="41057-342", category="blusas", line="Glam", price=563.90, old_price=None,
        images=[img("photo-1609505848912-b7c3b8b4beda"), img("photo-1685278463760-cd2134ab9d8a")],
        colors=[("Off White", "#F5F1EA")],
        description="Babados sculpted em off white com ombro à mostra. Romanticismo glamouroso para ocasiões que pedem brilho próprio.",
        composition="100% algodão pima",
        mais_vendida=True,
    ),
    dict(
        slug="cropped-western-marrom", name="CROPPED WESTERN MARROM",
        reference="40385-1105", category="blusas", line="Trendy", price=149.45, old_price=298.90,
        images=[img("photo-1593380090147-a2192b72a9ae"), img("photo-1627577279474-b87fe8490617")],
        colors=[("Marrom", "#6B4226")],
        description="Estampa floral western em cropped moderno. Duas eras da moda em uma peça só.",
        composition="97% poliéster, 3% elastano",
        trends=True,
    ),
    dict(
        slug="regata-canelado-diferenciado-bege-mediterraneo", name="REGATA CANELADO DIFERENCIADO BEGE MEDITERRÂNEO",
        reference="41177-1554", category="blusas", line="Basic", price=140.90, old_price=None,
        images=[img("photo-1685278463760-cd2134ab9d8a"), img("photo-1646589391794-566792b13cae")],
        colors=[("Bege", "#D9C7A7"), ("Marrom", "#6B4226")],
        description="Canelado diferenciado no bege mediterrâneo. A regata coringa que vestirá seu dia a dia com leveza.",
        composition="92% viscose, 8% elastano",
        mais_vendida=True, trends=True,
    ),
    dict(
        slug="regata-renda-superjeans-preto", name="REGATA RENDA SUPERJEANS PRETO",
        reference="41185-1", category="blusas", line="Superjeans", price=140.90, old_price=None,
        images=[img("photo-1627577279474-b87fe8490617"), img("photo-1646589391794-566792b13cae")],
        colors=[("Preto", "#171717")],
        description="Renda delicada em preto profundo. A aliada perfeita dos seus jeans favoritos.",
        composition="80% nylon, 20% elastano",
        mais_vendida=True,
    ),
    dict(
        slug="manga-longa-transp-mais-gata-preto", name="MANGA LONGA TRANSP MAIS GATA PRETO",
        reference="40565-1", category="blusas", line="Mais Gata", price=91.95, old_price=183.90,
        images=[img("photo-1581841064838-a470c740e8ee"), img("photo-1627577279474-b87fe8490617")],
        colors=[("Preto", "#171717")],
        description="Tecido transparente com acabamento impecável. Segredo revelado com sofisticação.",
        composition="100% poliéster",
    ),
    dict(
        slug="t-shirt-polo-trico-jatoba", name="T-SHIRT POLO TRICÔ JATOBÁ",
        reference="41270-1270", category="blusas", line="Basic", price=328.90, old_price=None,
        images=[img("photo-1581497396202-5645e76a3a8e"), img("photo-1536992266094-82847e1fd431")],
        colors=[("Jatobá", "#9C6B3E")],
        description="Tricô artesanal no tom jatobá com gola polo. A peça feita à mão que vira herança de guarda-roupa.",
        composition="60% algodão, 40% acrílico",
        novidade=True, destaque=True,
    ),
    dict(
        slug="blusa-trico-gola-alta-mocha", name="BLUSA TRICÔ GOLA ALTA MOCHA",
        reference="41271-1280", category="blusas", line="Basic", price=144.95, old_price=289.90,
        images=[img("photo-1536992266094-82847e1fd431"), img("photo-1603906650843-b58e94d9df4d")],
        colors=[("Mocha", "#A87E6D")],
        description="Gola alta em tricô mocha para aquecer com estilo. Conforto que não abre mão da feminilidade.",
        composition="65% acrílico, 35% lã",
    ),
    dict(
        slug="calca-mom-denim-30-super-price-blue-stone", name="CALÇA MOM DENIM 30 SUPER PRICE BLUE STONE",
        reference="40821-165", category="calcas", line="Superjeans", price=190.95, old_price=381.90,
        images=[img("photo-1541099649105-f69ad21f3246"), img("photo-1475178626620-a4d074967452")],
        colors=[("Blue Stone", "#5B7A9D")],
        description="Modelagem mom na lavagem blue stone com cintura súper alta. O arquivo dos anos 90 com tecnologia 2026.",
        composition="98% algodão, 2% elastano",
        jeans=True,
    ),
    dict(
        slug="skinny-25-tecnologia-blue-stone", name="SKINNY 25 TECNOLOGIA BLUE STONE",
        reference="40840-165", category="calcas", line="Superjeans", price=206.95, old_price=413.90,
        images=[img("photo-1546635834-78554e816d55"), img("photo-1602293589930-45aad59ba3ab")],
        colors=[("Blue Stone", "#5B7A9D")],
        description="Skinny com tecnologia super power que modela e valoriza as curvas. Blue stone eterno.",
        composition="70% algodão, 28% poliéster, 2% elastano",
        jeans=True,
    ),
    dict(
        slug="calca-boot-cut-power-marrom-wood", name="CALÇA BOOT CUT POWER MAIS GATA MARROM WOOD",
        reference="40898-1244", category="calcas", line="Mais Gata", price=218.45, old_price=436.90,
        images=[img("photo-1666635213698-0ea75f64e79c"), img("photo-1758900728131-32b8fa6fcda4")],
        colors=[("Marrom Wood", "#5C3A21")],
        description="Boot cut no marrom wood com elastano power. alonga, modela e empodera.",
        composition="72% algodão, 26% poliéster, 2% elastano",
        jeans=True,
    ),
    dict(
        slug="calca-reta-27-bordado-manual", name="CALÇA RETA 27 BORDADO MANUAL",
        reference="40807-1600", category="calcas", line="Trendy", price=310.45, old_price=620.90,
        images=[img("photo-1523359346063-d879354c0ea5"), img("photo-1758900727792-e411697fc0a7")],
        colors=[("Jeans", "#4C6785")],
        description="Bordado manual exclusivo em modelagem reta 27. Cada peça carrega horas de ateliê.",
        composition="99% algodão, 1% elastano",
        jeans=True, destaque=True,
    ),
    dict(
        slug="agr-wide-leg-30-sarja-gold-avela", name="AGR WIDE LEG 30 SARJA GOLD AVELÃ",
        reference="40844-1299", category="calcas", line="Trendy", price=218.45, old_price=436.90,
        images=[img("photo-1758900727792-e411697fc0a7"), img("photo-1523359346063-d879354c0ea5")],
        colors=[("Avelã", "#B08A5A")],
        description="Wide leg em sarja gold avelã com caimento pesado. Elegância que anda com você.",
        composition="96% poliéster, 4% elastano",
    ),
    dict(
        slug="jeans-slim-perfect-fit-medio", name="JEANS SLIM PERFECT FIT MÉDIO",
        reference="41601-201", category="calcas", line="Superjeans", price=369.90, old_price=None,
        images=[img("photo-1602293589930-45aad59ba3ab"), img("photo-1546635834-78554e816d55")],
        colors=[("Jeans Médio", "#6B87A5")],
        description="Slim perfeito na lavagem média. O jeans que entende o corpo da mulher brasileira.",
        composition="94% algodão, 5% poliéster, 1% elastano",
        novidade=True, jeans=True,
    ),
    dict(
        slug="shorts-jeans-27-arrumado", name="SHORTS JEANS 27 ARRUMADO",
        reference="41115-1600", category="shorts-e-saias", line="Superjeans", price=422.90, old_price=None,
        images=[img("photo-1585145197082-dba095ba01ab"), img("photo-1541099649105-f69ad21f3246")],
        colors=[("Jeans", "#4C6785")],
        description="Barra arrumada e cintura alta: o shorts jeans que veste bem e rende looks infinitos.",
        composition="98% algodão, 2% elastano",
        mais_vendida=True, jeans=True,
    ),
    dict(
        slug="shorts-cintura-alta-boho-chic-mocha-mousse", name="SHORTS CINTURA ALTA BOHO CHIC MOCHA MOUSSE",
        reference="40551-1208", category="shorts-e-saias", line="Mais Gata", price=195.45, old_price=390.90,
        images=[img("photo-1526820687106-ac87a50476d3"), img("photo-1760044567401-393a152ead5e")],
        colors=[("Mocha Mousse", "#A87E6D")],
        description="Cintura alta em mocha mousse, o tom da estação. Boho chic para dias dourados.",
        composition="75% algodão, 23% poliéster, 2% elastano",
    ),
    dict(
        slug="saia-elastano-super-power-ecru", name="SAIA ELASTANO SUPER POWER ECRU",
        reference="40828-825", category="shorts-e-saias", line="Basic", price=114.95, old_price=229.90,
        images=[img("photo-1568467020752-b08fbd48e878"), img("photo-1526820687106-ac87a50476d3")],
        colors=[("Ecru", "#EFE6D8")],
        description="Tecido super power em ecru que abraça sem apertar. A saia que acompanha cada movimento.",
        composition="68% viscose, 30% elastano, 2% poliamida",
        trends=True,
    ),
    dict(
        slug="bermuda-baggy-27-unissex", name="BERMUDA BAGGY 27 UNISSEX",
        reference="41039-1600", category="shorts-e-saias", line="Superjeans", price=422.90, old_price=None,
        images=[img("photo-1541099649105-f69ad21f3246"), img("photo-1585145197082-dba095ba01ab")],
        colors=[("Jeans", "#4C6785")],
        description="Baggy autêntica em denim resistente. Atitude street com DNA Gatabakana.",
        composition="100% algodão",
        mais_vendida=True, jeans=True,
    ),
    dict(
        slug="saia-midi-plissada-solaris", name="SAIA MIDI PLISSADA SOLARIS",
        reference="41610-301", category="shorts-e-saias", line="Trendy", price=279.90, old_price=None,
        images=[img("photo-1760044567401-393a152ead5e"), img("photo-1568467020752-b08fbd48e878")],
        colors=[("Solar", "#C44837")],
        description="Plissado fluido no tom solar. Cada passo vira um movimento de luz.",
        composition="100% poliéster reciclado",
        novidade=True,
    ),
    dict(
        slug="bikini-canelado-ibiza-terracota", name="BIKINI CANELADO IBIZA TERRACOTA",
        reference="41701-401", category="beachwear", line="Beachwear", price=189.90, old_price=None,
        images=[img("photo-1571425046076-94af69bd4201"), img("photo-1591901559829-ce65d7eaca0a")],
        colors=[("Terracota", "#C44837")],
        description="Canelado texturizado no terracota da coleção Take me to Ibiza. Feito para brilhar à beira-mar.",
        composition="82% poliamida, 18% elastano",
        novidade=True, destaque=True,
    ),
    dict(
        slug="maio-pos-praia-rose", name="MAIÔ PÓS-PRAIA ROSÉ",
        reference="41702-402", category="beachwear", line="Beachwear", price=249.90, old_price=None,
        images=[img("photo-1644418747461-0fbca757d369"), img("photo-1570700005880-4ecdb8595d4a")],
        colors=[("Rosé", "#D96A7B")],
        description="Do mergulho ao sunset sem trocar de look. Maiô em rosé com proteção solar.",
        composition="85% poliamida, 15% elastano",
        novidade=True,
    ),
    dict(
        slug="conjunto-bahia-stripes", name="CONJUNTO BAHIA STRIPES",
        reference="41703-403", category="beachwear", line="Beachwear", price=109.95, old_price=219.90,
        images=[img("photo-1562904665-1ac60f530cb8"), img("photo-1571425046076-94af69bd4201")],
        colors=[("Marinho", "#2B3A55")],
        description="Listras náuticas com laço vermelho. O conjunto que traduz o espírito litorâneo catarinense.",
        composition="88% poliamida, 12% elastano",
    ),
    dict(
        slug="agr-conjunto-navy-marinho", name="AGR CONJUNTO NAVY MARINHO",
        reference="41398-153", category="conjuntos-e-casacos", line="Trendy", price=516.90, old_price=None,
        images=[img("photo-1758900728131-32b8fa6fcda4"), img("photo-1758900727792-e411697fc0a7")],
        colors=[("Marinho", "#2B3A55")],
        description="Blazer e calça em navy marinho de alfaiataria impecável. O conjunto que comanda salas e jantares.",
        composition="64% poliéster, 34% viscose, 2% elastano",
        mais_vendida=True, destaque=True, trends=True,
    ),
    dict(
        slug="conjunto-trico-com-saia-preto", name="CONJUNTO TRICÔ COM SAIA PRETO",
        reference="40947-1", category="conjuntos-e-casacos", line="Glam", price=344.95, old_price=689.90,
        images=[img("photo-1758900727792-e411697fc0a7"), img("photo-1603906650843-b58e94d9df4d")],
        colors=[("Preto", "#171717")],
        description="Tricô canelado com saia midi no preto eterno. O amplamente desejado da estação, agora com 50% OFF.",
        composition="70% viscose, 30% poliamida",
        trends=True,
    ),
    dict(
        slug="casaco-alongado-off-white", name="CASACO ALONGADO OFF WHITE",
        reference="40685-342", category="conjuntos-e-casacos", line="Glam", price=390.95, old_price=781.90,
        images=[img("photo-1581497396202-5645e76a3a8e"), img("photo-1581841064838-a470c740e8ee")],
        colors=[("Off White", "#F5F1EA")],
        description="Casaco alongado em off white com cinto de amarrar. O terceiro pedaço que eleva qualquer look.",
        composition="58% lã, 40% poliéster, 2% elastano",
    ),
]


async def main() -> None:
    await db.products.delete_many({})
    await db.categories.delete_many({})

    await db.categories.insert_many(list(CATEGORIES))

    docs = []
    for p in PRODUCTS:
        colors, sizes, flags = p["colors"], p.get("sizes") or clothing_sizes(), p
        doc = Product(
            slug=p["slug"], name=p["name"], reference=p["reference"], category=p["category"],
            line=p["line"], price=p["price"], old_price=p["old_price"], images=p["images"],
            colors=[{"name": n, "hex": h} for n, h in colors], sizes=sizes,
            description=p["description"], composition=p["composition"],
            novidade=p.get("novidade", False), mais_vendida=p.get("mais_vendida", False),
            destaque=p.get("destaque", False), trends=p.get("trends", False), jeans=p.get("jeans", False),
        ).model_dump()
        docs.append(doc)
    await db.products.insert_many(docs)

    # re-running seed.py after a drop wipes indexes — recreate them
    await ensure_indexes()
    print(f"Seeded {len(docs)} products and {len(CATEGORIES)} categories.")


if __name__ == "__main__":
    asyncio.run(main())
