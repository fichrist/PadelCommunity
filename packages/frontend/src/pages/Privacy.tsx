import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <AppLayout showCreateDropdown={false}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-comfortaa">Privacybeleid</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              Laatst bijgewerkt: {new Date().toLocaleDateString('nl-BE')}
            </p>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">1. Inleiding</h2>
              <p>
                Padel Community respecteert je privacy en zet zich in voor de bescherming van je persoonsgegevens.
                Dit privacybeleid legt uit hoe wij je gegevens verzamelen, gebruiken en beschermen in overeenstemming
                met de Algemene Verordening Gegevensbescherming (AVG/GDPR).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">2. Welke gegevens verzamelen wij?</h2>
              <p>Wij verzamelen de volgende persoonsgegevens:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Accountgegevens:</strong> E-mailadres, naam, profielfoto (optioneel)</li>
                <li><strong>Locatiegegevens:</strong> Je locatie wordt alleen gebruikt om de afstand tot events te berekenen</li>
                <li><strong>Spelersgegevens:</strong> Padel niveau, club, speelvoorkeuren</li>
                <li><strong>Gebruiksgegevens:</strong> Events waaraan je deelneemt, berichten binnen het platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">3. Waarvoor gebruiken wij je gegevens?</h2>
              <p>Je gegevens worden uitsluitend gebruikt voor:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Afstandsberekening:</strong> Om te tonen hoe ver events van jou verwijderd zijn</li>
                <li><strong>Gepersonaliseerde weergave:</strong> Om events en spelers te filteren op basis van je voorkeuren</li>
                <li><strong>Accountbeheer:</strong> Om je account te beheren en in te loggen</li>
                <li><strong>Communicatie:</strong> Om berichten te versturen naar andere spelers binnen het platform</li>
              </ul>
              <p className="mt-4 font-medium">
                Wij delen je gegevens NOOIT met derden voor commerciele doeleinden.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">4. Rechtsgrondslag</h2>
              <p>Wij verwerken je gegevens op basis van:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Toestemming:</strong> Je geeft expliciete toestemming bij het aanmaken van je account</li>
                <li><strong>Uitvoering van de overeenkomst:</strong> De verwerking is noodzakelijk om onze diensten te leveren</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">5. Je rechten</h2>
              <p>Onder de GDPR heb je de volgende rechten:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Recht op inzage:</strong> Je kunt opvragen welke gegevens wij van je hebben</li>
                <li><strong>Recht op rectificatie:</strong> Je kunt je gegevens laten corrigeren</li>
                <li><strong>Recht op verwijdering:</strong> Je kunt vragen om al je gegevens te verwijderen</li>
                <li><strong>Recht op overdraagbaarheid:</strong> Je kunt je gegevens opvragen in een leesbaar formaat</li>
                <li><strong>Recht om toestemming in te trekken:</strong> Je kunt je toestemming op elk moment intrekken</li>
              </ul>
              <p className="mt-4">
                Je kunt deze rechten uitoefenen via je profielinstellingen of door contact met ons op te nemen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">6. Cookies</h2>
              <p>Wij gebruiken alleen functionele cookies die noodzakelijk zijn voor:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Het onthouden van je login-sessie</li>
                <li>Het opslaan van je cookie-voorkeuren</li>
              </ul>
              <p className="mt-4">
                Wij gebruiken geen tracking cookies of cookies voor marketingdoeleinden.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">7. Beveiliging</h2>
              <p>
                Wij nemen passende technische en organisatorische maatregelen om je gegevens te beschermen tegen
                ongeoorloofde toegang, verlies of misbruik. Je gegevens worden opgeslagen op beveiligde servers
                met encryptie.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">8. Bewaartermijn</h2>
              <p>
                Wij bewaren je gegevens zolang je een actief account hebt. Na verwijdering van je account worden
                al je persoonsgegevens binnen 30 dagen permanent verwijderd.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">9. Contact</h2>
              <p>
                Voor vragen over dit privacybeleid of om je rechten uit te oefenen, kun je contact opnemen via
                de contactgegevens op onze website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">10. Wijzigingen</h2>
              <p>
                Wij kunnen dit privacybeleid van tijd tot tijd aanpassen. Belangrijke wijzigingen worden
                gecommuniceerd via de website of per e-mail.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Privacy;
