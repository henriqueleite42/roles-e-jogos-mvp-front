export const metadata = {
	title: "Termos de Uso",
	description: "Conheça os Termos de Uso da nossa comunidade",
}

export default function TermosDeUso() {
	return (
		<>
			<div className="max-w-4xl mx-auto px-6 py-12">
				<h1 className="text-4xl font-bold mb-8 text-center text-primary">Termos de Uso</h1>

				<section className="mb-10">
					<h2 className="text-2xl font-semibold mb-2 text-primary">1. Aceitação dos Termos</h2>
					<p>
						Ao acessar e utilizar o site <strong>{process.env.NEXT_PUBLIC_WEBSITE_NAME}</strong>, você concorda com estes Termos de Uso.
						Caso não concorde com algum dos termos aqui descritos, pedimos que não utilize nossos serviços.
					</p>
				</section>

				<section className="mb-10">
					<h2 className="text-2xl font-semibold mb-2 text-primary">2. Descrição do Serviço</h2>
					<p>
						O <strong>{process.env.NEXT_PUBLIC_WEBSITE_NAME}</strong> é uma plataforma que permite aos usuários criar, manter e compartilhar
						publicamente suas coleções de jogos de tabuleiro, cartas, RPG, entre outros. Também é possível interagir
						com outros usuários por meio de comentários, curtidas e sugestões.
					</p>
				</section>

				<section className="mb-10">
					<h2 className="text-2xl font-semibold mb-2 text-primary">3. Cadastro e Responsabilidades do Usuário</h2>
					<ul className="list-disc pl-6 space-y-1">
						<li>Para utilizar todas as funcionalidades do site, é necessário criar uma conta.</li>
						<li>O usuário se compromete a fornecer informações verdadeiras, completas e atualizadas.</li>
						<li>O usuário é responsável por manter a confidencialidade de suas credenciais de acesso.</li>
						<li>É proibido usar o site para fins ilegais, ofensivos ou que violem direitos de terceiros.</li>
					</ul>
				</section>

				<section className="mb-10">
					<h2 className="text-2xl font-semibold mb-2 text-primary">4. Conteúdo Gerado pelo Usuário</h2>
					<p className="mb-2">
						Todo conteúdo enviado ou compartilhado no site (descrições, imagens, comentários, etc.)
						continua sendo de propriedade do usuário.
					</p>
					<p className="mb-2">
						Ao postar conteúdo, o usuário concede ao <strong>{process.env.NEXT_PUBLIC_WEBSITE_NAME}</strong> uma licença não exclusiva,
						mundial e gratuita para exibir, divulgar e armazenar esse conteúdo.
					</p>
					<p>
						O usuário garante que possui os direitos necessários sobre qualquer conteúdo enviado.
					</p>
				</section>

				<section className="mb-10">
					<h2 className="text-2xl font-semibold mb-2 text-primary">5. Propriedade Intelectual</h2>
					<p>
						Todo o conteúdo e funcionalidades originais do <strong>{process.env.NEXT_PUBLIC_WEBSITE_NAME}</strong> (layout, marca, código,
						design, etc.) são protegidos por direitos autorais e pertencem ao <strong>{process.env.NEXT_PUBLIC_LEGAL_REPRESENTATIVE_NAME}</strong>.
						É proibida a reprodução sem autorização expressa.
					</p>
				</section>

				<section className="mb-10">
					<h2 className="text-2xl font-semibold mb-2 text-primary">6. Moderação e Remoção de Conteúdo</h2>
					<p className="mb-2">Reservamo-nos o direito de remover, a qualquer momento, conteúdo que:</p>
					<ul className="list-disc pl-6 space-y-1">
						<li>viole estes Termos;</li>
						<li>contenha discurso de ódio, violência ou assédio;</li>
						<li>infrinja direitos autorais ou de imagem.</li>
					</ul>
				</section>

				<section className="mb-10">
					<h2 className="text-2xl font-semibold mb-2 text-primary">7. Disponibilidade e Modificações</h2>
					<p>
						O <strong>{process.env.NEXT_PUBLIC_WEBSITE_NAME}</strong> pode ser alterado, interrompido ou descontinuado a qualquer momento,
						com ou sem aviso prévio. Também podemos atualizar estes Termos periodicamente, sendo responsabilidade
						do usuário consultá-los regularmente.
					</p>
				</section>

				<section className="mb-10">
					<h2 className="text-2xl font-semibold mb-2 text-primary">8. Limitação de Responsabilidade</h2>
					<p className="mb-2">Não nos responsabilizamos por:</p>
					<ul className="list-disc pl-6 space-y-1">
						<li>eventuais perdas ou danos decorrentes do uso do site;</li>
						<li>veracidade ou qualidade do conteúdo publicado por usuários;</li>
						<li>indisponibilidade temporária da plataforma.</li>
					</ul>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-2 text-primary">9. Contato</h2>
					<p>
						Para dúvidas, sugestões ou solicitações, entre em contato pelo e-mail: <strong>{process.env.NEXT_PUBLIC_LEGAL_EMAIL_CONTACT}</strong>.
					</p>
				</section>
			</div>
		</>
	)
}