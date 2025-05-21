export default function PoliticaDePrivacidade() {
	return (
		<div>
			<div className="max-w-4xl mx-auto px-6 py-12">
				<h1 className="text-4xl font-bold mb-8 text-center text-primary">Política de Privacidade</h1>

				<p className="mb-6">
					Esta Política de Privacidade descreve como suas informações pessoais são coletadas, usadas e protegidas ao utilizar o site <strong>{process.env.NEXT_PUBLIC_WEBSITE_NAME}</strong>.
				</p>

				<section className="mb-10">
					<h2 className="text-2xl font-semibold mb-2 text-primary">1. Informações Coletadas</h2>
					<p className="mb-2">Podemos coletar os seguintes dados:</p>
					<ul className="list-disc pl-6 space-y-1">
						<li>Nome e e-mail ao criar uma conta;</li>
						<li>Informações do seu perfil e coleção de jogos;</li>
						<li>Comentários, avaliações e interações com outros usuários;</li>
						<li>Informações técnicas, como endereço IP, navegador e sistema operacional.</li>
					</ul>
				</section>

				<section className="mb-10">
					<h2 className="text-2xl font-semibold mb-2 text-primary">2. Uso das Informações</h2>
					<p className="mb-2">As informações coletadas são utilizadas para:</p>
					<ul className="list-disc pl-6 space-y-1">
						<li>Fornecer e melhorar os serviços oferecidos pelo <strong>{process.env.NEXT_PUBLIC_WEBSITE_NAME}</strong>;</li>
						<li>Personalizar sua experiência na plataforma;</li>
						<li>Enviar comunicações importantes, como notificações e atualizações;</li>
						<li>Garantir a segurança e prevenir atividades fraudulentas.</li>
					</ul>
				</section>

				<section className="mb-10">
					<h2 className="text-2xl font-semibold mb-2 text-primary">3. Compartilhamento de Dados</h2>
					<p className="mb-2">Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto quando:</p>
					<ul className="list-disc pl-6 space-y-1">
						<li>Requerido por lei ou autoridade competente;</li>
						<li>Necessário para prestação de serviços por parceiros (por exemplo, hospedagem de dados);</li>
						<li>Com seu consentimento expresso.</li>
					</ul>
				</section>

				<section className="mb-10">
					<h2 className="text-2xl font-semibold mb-2 text-primary">4. Cookies</h2>
					<p className="mb-2">Utilizamos cookies para:</p>
					<ul className="list-disc pl-6 space-y-1">
						<li>Melhorar o desempenho e funcionalidade do site;</li>
						<li>Coletar dados de navegação para análise e melhorias;</li>
						<li>Lembrar preferências do usuário.</li>
					</ul>
					<p className="mt-2">Você pode configurar seu navegador para recusar cookies, mas isso pode afetar o funcionamento do site.</p>
				</section>

				<section className="mb-10">
					<h2 className="text-2xl font-semibold mb-2 text-primary">5. Segurança</h2>
					<p>
						Adotamos medidas técnicas e organizacionais para proteger seus dados pessoais contra acesso não autorizado, perda ou destruição.
					</p>
				</section>

				<section className="mb-10">
					<h2 className="text-2xl font-semibold mb-2 text-primary">6. Acesso e Controle dos Dados</h2>
					<p className="mb-2">Você pode a qualquer momento:</p>
					<ul className="list-disc pl-6 space-y-1">
						<li>Editar suas informações pessoais na sua conta;</li>
						<li>Solicitar a exclusão de sua conta e dados;</li>
						<li>Entrar em contato para esclarecer dúvidas sobre o uso dos seus dados.</li>
					</ul>
				</section>

				<section className="mb-10">
					<h2 className="text-2xl font-semibold mb-2 text-primary">7. Alterações nesta Política</h2>
					<p>
						Podemos atualizar esta Política de Privacidade periodicamente. Recomendamos que você revise esta página com frequência para estar ciente de quaisquer alterações.
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-2 text-primary">8. Contato</h2>
					<p>
						Para dúvidas ou solicitações relacionadas à privacidade, entre em contato pelo e-mail: <strong>{process.env.NEXT_PUBLIC_LEGAL_EMAIL_CONTACT}</strong>.
					</p>
				</section>
			</div>
		</div>
	)
}