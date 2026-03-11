const speakers = [
    {
        "name":  "Abby Roberts",
        "designation":  "Project Manager, INHOPE",
        "category":  "International",
        "photo":  "Abby Roberts.jpg",
        "bio":  "Abby Roberts is a Project Manager at INHOPE, where for six years she has advanced online safety through capacity building, advocacy, and legislative harmonisation. She oversees hotline governance under the Better Internet for Kids programme and manages the Global Standard Project, implementing the Universal Classification Schema. Before joining INHOPE, Abby built expertise in international law and advocacy with a global pro-bono law firm, a refugee resettlement non-profit, and a boutique litigation firm specialising in complex disputes. She holds an LL.M. in International Law and Security from Vrije Universiteit Amsterdam and a B.A. in Political Science and International Relations from Carthage College."
    },
    {
        "name":  "Abhishek Singh",
        "designation":  "Additional Secretary, MeitY, Govt. of India",
        "category":  "Government",
        "photo":  "Abhishek Singh.png",
        "bio":  "Abhishek Singh is an officer of the 1995 batch of IAS with diverse experience in administration, managing law and order, implementing development programs, and policy formulation at Central Government with regard to the use of Technology for improving Governance. He is presently posted as Additional Secretary, Ministry of Electronics and Information Technology, Government of India, with responsibilities of Artificial Intelligence \u0026 Emerging Technologies, Cyber Security and Digital Skilling. Abhishek is an IIT Kanpur alumnus and did his Masters in Public Administration from Harvard Kennedy School of Government as a Mason fellow in May 2013."
    },
    {
        "name":  "Akansha Kasera",
        "designation":  "Senior Market Engagement Manager, the GSMA",
        "category":  "Technology",
        "photo":  "Akansha Kasera.png",
        "bio":  "Akansha is dedicated to building meaningful relationships and designing thoughtful solutions that create equity and welfare. With over a decade of experience in the international development space, she currently serves as Senior Market Engagement Manager at the GSMA, working on pathways that help bridge the gender digital divide. She is currently pursuing her MBA in Policy Analysis from the Indian School of Business and holds a Master’s in Public Policy from the Jindal School of Governance and Public Policy, and an undergraduate degree in Literature with a minor in Psychology from the Delhi University."
    },
    {
        "name":  "Akash Pugalia",
        "designation":  "Global Executive, TP",
        "category":  "Technology",
        "photo":  "Akash Pugalia.jpg",
        "bio":  "Akash Pugalia is a global executive with 24+ years in the BPO industry, spearheading innovation in AI/ML Data Services and Trust \u0026 Safety. At TP, he partners with Fortune 500s to deliver scalable data pipelines, ethical AI governance, and platform safety solutions that fuel Generative AI and enterprise growth with trust. A recognized AI data expert and thought leader, Akash is renowned for transforming emerging AI into measurable business impact and advancing global best practices in Responsible AI."
    },
    {
        "name":  "Amelia Wierda",
        "designation":  "Legal Counsel for Human Rights, Booking.com",
        "category":  "Technology",
        "photo":  "Amelia Wierda.png",
        "bio":  "Amelia Wierda is an accomplished attorney and human rights specialist currently serving as Legal Counsel for Human Rights at Booking.com, where she focuses on integrating regulatory requirements and risk management into business practices. She is a primary point of contact for strategically significant human rights risk management, including escalations related to human trafficking and online safety, acting as a key liaison to business partners in the Trust \u0026 Safety and Content Integrity teams. Amelia brings a unique perspective from both the public and private sectors, including experience assisting with human trafficking and OSEC prosecutions in the U.S. and the Philippines, as well as work in UN and international tribunals. She has over 15 years experience actively engaging in anti-trafficking efforts as a speaker and advocate."
    },
    {
        "name":  "Andras Malnar",
        "designation":  "Senior Digital Policy Manager, TUM Think Tank",
        "category":  "Academia \u0026 Media",
        "photo":  "Andras Malnar.jpg",
        "bio":  "Andras Molnar is Senior Digital Policy Manager \u0026 Director of Online Safety at the TUM Think Tank. He leads projects on digital policy, including artificial intelligence, data governance and privacy, cybersecurity, and children in the digital environment, providing evidence-based policy analysis and guidance to stakeholders. Andras also directs the Think Tank’s online safety portfolio. In addition to his role at the TUM Think Tank, Andras is an Affiliate at Harvard University’s Berkman Klein Center for Internet \u0026 Society, where he lectures and develops research on digital transformation, focusing on how it can be shaped to serve economic and societal priorities."
    },
    {
        "name":  "Anne Collier",
        "designation":  "Founder and Executive Director, Net Family News, Inc.",
        "category":  "Academia \u0026 Media",
        "photo":  "Anne Collier.jpg",
        "bio":  "A writer and youth rights advocate, Anne Collier is founder and executive director of the US-based nonprofit Net Safety Collaborative and has been chronicling developments in children and teens\u0027 tech and media use at NetFamilyNews.org since 1999. She is currently strategy lead in the development of a child rights-based regulatory sandbox for child online safety and wellbeing, a first in the 25+ year-old field of child online safety. Anne has served on three national task forces on youth Internet safety, advises platforms such as Roblox, YouTube and Yubo and, with scholars at Stanford University, co-edited Social Media and Youth Mental Health, published in 2024 by the American Psychiatric Association."
    },
    {
        "name":  "Anne Collier - CH emailed",
        "designation":  "",
        "category":  "Academia \u0026 Media",
        "photo":  "Anne Collier.jpg",
        "bio":  ""
    },
    {
        "name":  "Anshul Tewari",
        "designation":  "Founder \u0026 CEO of Youth Ki Awaaz (YKA)",
        "category":  "Academia \u0026 Media",
        "photo":  "Anshul Tewari.jpg",
        "bio":  "Anshul Tewari is the Founder \u0026 CEO of Youth Ki Awaaz (YKA) — India’s largest citizen-media and civic engagement platform, reaching over 20 million people every month. Through storytelling, data, and technology, YKA empowers a community of over 200,000 young people every month to shape conversations on issues like online safety, climate, and inclusion, while helping institutions tap into real-time youth insights. Anshul is a 2025 Skoll World Fellow, Ashoka Fellow, and Forbes 30 Under 30 Asia honoree. He also serves on the Global Safety Advisory Board of Snap Inc., is a founding trustee of the Misinformation Combat Alliance, and a Board Trustee at the Internet Freedom Foundation."
    },
    {
        "name":  "Anupriya Kapur",
        "designation":  "Digital Influencer and Life Coach",
        "category":  "Academia \u0026 Media",
        "photo":  "Anupriya Kapur.jpg",
        "bio":  "Anupriya Kapur is a digital influencer and life coach whose work spans fitness, travel, and lifestyle. A single parent, she uses her platform to share body-positive messages, fitness insights, and experiences from her personal journey. Through her content, she encourages self-care, authenticity, and resilience, inspiring audiences to navigate life’s challenges with confidence."
    },
    {
        "name":  "Aparajita Bharti",
        "designation":  "Co-Founder of The Quantum Hub and YLAC",
        "category":  "Civil Society",
        "photo":  "Aparajita Bharti.jpg",
        "bio":  "Aparajita Bharti is the co-founder of The Quantum Hub (TQH), a leading public policy firm based out of Delhi and Young Leaders for Active Citizenship (YLAC) that works with young people to increase their participation in democratic processes. Her work in trust and safety has specifically focused on children\u0027s online safety and women\u0027s participation in the digital economy. She advises multiple tech platforms on privacy and youth wellbeing. She writes in leading publications around these topics."
    },
    {
        "name":  "Ayush Verma",
        "designation":  "Senior Analyst, T\u0026S, Resolver",
        "category":  "Technology",
        "photo":  "Ayush Verma.jpg",
        "bio":  "Ayush Verma is Senior Analyst, Trust \u0026 Safety, at Resolver, leading a team in India to identify, assess, and mitigate nuanced risks in hate speech, violent extremism, and graphic violence across Indic languages. With an MA in International Relations and over three years in trust and safety, he has authored policy-relevant research, including contributions to Combating Terrorism Center (CTC) Sentinel and the book The Islamic State in Afghanistan \u0026 Pakistan. Ayush’s expertise in geopolitical risk, threat intelligence, and policy shaping drives his mission to create safer online spaces, protecting global communities from emerging threats in the online ecosystem."
    },
    {
        "name":  "Bansuri Swaraj",
        "designation":  "Member of Parliament, Government of India",
        "category":  "Government",
        "photo":  "Bansuri Swaraj.jpg",
        "bio":  "Bansuri Swaraj is an Indian lawyer and politician currently serving as Member of Parliament (Lok Sabha) for New Delhi. She earned her BA in English Literature from the University of Warwick, studied law at BPP Law School and qualified as a Barrister from the Inner Temple, completing a Master of Studies at Oxford University."
    },
    {
        "name":  "Barkha Dutt",
        "designation":  "Award-winning TV journalist, anchor and columnist",
        "category":  "Academia \u0026 Media",
        "photo":  "Barkha Dutt.png",
        "bio":  "Barkha Dutt is one of India\u0027s best known broadcast journalists. With close to 30 years of reporting experience Barkha shot to fame with her frontline reporting of the Kargil war in 1999. After two decades with NDTV she left to start her own company, digital platform Mojo Story. She is the winner of more than 60 national and international awards including India\u0027s fourth highest civilian honour, the Padmashri. She has also been recognised as a Global Leader for Tomorrow by the World Economic Forum. Barkha Dutt is a columnist with the Washington Post, Hindustan Times, The Week, and Dainik Bhaskar."
    },
    {
        "name":  "Barsha Chakraborty",
        "designation":  "Feminist Practitioner",
        "category":  "Civil Society",
        "photo":  "Barsha Chakraborty.jpg",
        "bio":  "Barsha Chakraborty is a feminist practitioner working at the intersection of gender, technology, and social change. Her work focuses on addressing tech-facilitated gender-based violence, gendered disinformation, and the impact of emerging technologies on women and marginalised communities. With over a decade of experience, Barsha brings deep expertise in shaping narratives through social and behaviour change communication, and in designing evidence-based programmes and impact strategies that challenge oppressive gender norms and advocate for digital rights and justice. She is passionate about reimagining technology as a space for inclusion, dignity, and equality."
    },
    {
        "name":  "Breeze Liu",
        "designation":  "Founder and CEO, Alecto AI",
        "category":  "Technology",
        "photo":  "Breeze Liu.jpg",
        "bio":  "Breeze Liu is a globally recognized entrepreneur and activist reshaping the global response to online abuse. She is the founder and CEO of Alecto AI, a groundbreaking company building AI-powered infrastructure to combat online image abuse. Through her nonprofit, the Alecto Foundation, she also leads survivor-centered policy reform and international coalition building. As a survivor of both CSAM and deepfake abuse, Breeze transformed personal trauma into structural change—spearheading the historic \"Take It Down Act\", the first U.S. federal law to criminalize non-consensual intimate imagery and deepfake exploitation. Prior to founding Alecto AI, Breeze led Trust \u0026 Safety initiatives in Big Tech and built a successful career in venture capital. A graduate of UC Berkeley in Peace \u0026 Conflict Studies, she combines legal foresight, technical innovation, and philosophical depth to build scalable systems of justice. Breeze’s work has been featured in The New York Times, People Magazine, Wired, and on national television across continents."
    },
    {
        "name":  "Caroline Humer",
        "designation":  "Co Founder, Trust \u0026 Safety Festival",
        "category":  "Civil Society",
        "photo":  "Caroline Humer.jpg",
        "bio":  "Caroline Humer is a global child protection and digital safety expert with over 20 years of experience across non-profits, government, and the tech industry. She has worked at the U.S. National Center for Missing \u0026 Exploited Children and later at the International Centre for Missing \u0026 Exploited Children. Transitioning into the trust and safety field, Caroline mobilizes multi-stakeholder coalitions and tech firms to combat online harms, leading to the founding of the Trust \u0026 Safety Forum in 2022.In addition, Caroline co-founded STISA (Survivors \u0026 Tech Solving Image-based Sexual Abuse), the world’s first NGO focused with survivor centric approach to combatting image based sexual abuse online."
    },
    {
        "name":  "Chitra Iyer",
        "designation":  "CEO and Co-founder, Space2Grow",
        "category":  "Civil Society",
        "photo":  "Chitra Iyer.png",
        "bio":  "Ms. Chitra Iyer, Co-founder and CEO of Space2Grow, is a visionary social impact leader with over two decades of experience in child protection, anti-human trafficking and skill development. In 2013, she co-founded Livelihood Initiatives for Empowerment (LIFE), designing a presidentially launched skilling program for trafficking survivors. Through Space2Grow, co-founded with Anuj Singhal, she bridges intent to action for non-profits, ensuring digital safety, inclusive livelihoods and child rights via advisory, training and donor mobilization. An advocate for ethical product management and perseverance, she inspires women in the sector to prioritize impact."
    },
    {
        "name":  "Deborah Fry",
        "designation":  "Global Director of Data and Principal Investigator (PI), Childlight",
        "category":  "Academia \u0026 Media",
        "photo":  "Deborah Fry.png",
        "bio":  "Professor Deborah Fry (MA, MPH, PhD) has over 20 years of experience in researching violence against children. She is a Chair in International Child Protection Research at the University of Edinburgh. At the University, Professor Fry is the Global Director of Data and Principal Investigator (PI) for Childlight – Global Child Safety Institute where she leads research teams to better understand the prevalence and nature of child sexual exploitation and abuse (CSEA) globally and leads the world’s first index on CSEA prevalence (childlight.org)."
    },
    {
        "name":  "Deepesh Gupta,",
        "designation":  "Senior Director, TP",
        "category":  "Technology",
        "photo":  "Deepesh Gupta,.jpg",
        "bio":  "Deepesh brings over 15 years of deep domain expertise in IT-enabled services, with a strong focus on Trust \u0026 Safety operations across global financial institutions and high-tech enterprises. At TP, he has led quality assurance and service delivery for some of the most complex and sensitive T\u0026S workflows, ranging from content moderation for video streaming platforms to user safety for gaming ecosystems. His experience spans content review and tagging for leading social media platforms, search engines, and e-commerce giants. With a unique ability to identify synergies across diverse T\u0026S environments, Deepesh offers a holistic perspective on operational excellence, risk mitigation, and ethical AI integration. He will be sharing key insights during the Spotlight Event, drawing from his extensive work in safeguarding digital communities at scale. 8th October"
    },
    {
        "name":  "Dhruv Khosla",
        "designation":  "Practice Director, Everest Group",
        "category":  "Technology",
        "photo":  "Dhruv Khosla.jpg",
        "bio":  "Dhruv Khosla is a Practice Director at Everest Group, specializing in research on trust and safety services. In his role, he spearheads the production of published research, including provider evaluations, annual reports, and thought leadership across topics. Dhruv has collaborated with numerous enterprises, service providers, and technology vendors, providing support in areas such as market opportunity assessments, go-to-market strategy, M\u0026A target identification, benchmarking, and competitive intelligence."
    },
    {
        "name":  "Dr Nilesh Deshpande",
        "designation":  "Program Specialist, Adolescent and Youth Unit, UNFPA",
        "category":  "Civil Society",
        "photo":  "Dr Nilesh Deshpande.jpg",
        "bio":  "Dr Nilesh Deshpande is a public health specialist with over two decades of experience in adolescent and youth health, reproductive health, and program management across India and globally. He currently serves as the National Technical Specialist for Adolescent and Youth at UNFPA India, leading national initiatives and partnerships with government and UN agencies. Before this role, Dr Deshpande worked as State Programme Coordinator with UNFPA in Madhya Pradesh and Bihar, and as a Research Associate with the Johns Hopkins School of Public Health in Tanzania. Dr Deshpande holds a Master’s in Public Health from Johns Hopkins University, an MBA in Health Research Management, and an MBBS degree. He has authored several studies and evaluations on reproductive health, health systems, and adolescent programmes for UNFPA, USAID, and national health missions. With extensive experience spanning grassroots programme implementation to national policy advocacy, Dr Deshpande brings a strong perspective on advancing youth leadership, health, and rights in India and beyond."
    },
    {
        "name":  "Dr. Cuterus (Dr. Tanaya)",
        "designation":  "Content Creator \u0026 Educator, YouTube",
        "category":  "Academia \u0026 Media",
        "photo":  "Dr. Cuterus (Dr. Tanaya).jpg",
        "bio":  "The pioneer of the medical content creation niche in India, Dr. Tanaya is extremely passionate about public health education. After graduating from the University of Oxford, Dr Tanaya established her award winning online educational initiative - Dr Cuterus, and over the past three years has grown to become the most followed medical professional in India across several platforms, with a bestselling book, and a critically acclaimed podcast - highlighting her expertise in communicating complex and often taboo health topics to a large number of people. Her work focuses on sexual, reproductive, and menstrual health education, a highly stigmatised area of health \u0026 education. She envisions an equitable, healthier, and happier world using science, humour, and education for us all - a mission she has started by revolutionising the sex education landscape in India."
    },
    {
        "name":  "Dr. Rabindra Narayan Behera",
        "designation":  "Member of Parliament, Lok Sabha and Member of Parliamentary Standing Committee on",
        "category":  "Government",
        "photo":  "Dr. Rabindra Narayan Behera.png",
        "bio":  "Communications and Information Technology Dr. Rabindra Narayan Behera, is a Lok Sabha MP and a member of the Parliamentary Standing Committee on Communications and Information Technology. Dr Behera is a technocrat-turned politician as he served as the Senior Director at the National Informatics Centre (NIC). He also holds a PhD in Artificial Intelligence."
    },
    {
        "name":  "Dr. Ranjana Kumari",
        "designation":  "Director, Centre for Social Research (CSR India)",
        "category":  "Civil Society",
        "photo":  "Dr. Ranjana Kumari.jpg",
        "bio":  "Dr. Ranjana Kumari has been a leading advocate for women’s rights in India for over four decades, combining activism, scholarship, and policy engagement. She has advised the Government of India through roles on the National Commission for Women, Ministry of Women and Child Development, NHRC, and Ministry of Labour, and has served as a Gender Expert at the ILO and United Nations in Geneva. Recognized with national and international awards, including the Lotus Leadership Award, she was named among Apolitical’s 100 Most Influential People in Gender Policy. She also serves on Meta’s Global Advisory Council, the Advertising Standards Council of India, and was previously member of the Trust and Safety Council of Teleperformance and Twitter advocating for safe, respectful online spaces."
    },
    {
        "name":  "Dr. Samir Parikh",
        "designation":  "Director, Department of Mental Health and Behavioral Sciences, Fortis Mental Health",
        "category":  "Academia \u0026 Media",
        "photo":  "Dr. Samir Parikh.png",
        "bio":  "Dr. Samir Parikh is an eminent Psychiatrist and the Director of Department of Mental Health and Behavioural Sciences, Fortis Healthcare. He has done his graduation (MBBS), and Post-graduation (DPM and MD-psychiatry) from Civil hospital, Ahmedabad, and topped the university in both. He is one of the leading academic experts in the field of mental health and conducts training programmes and courses for doctors, Psychologists and allied specialities, and has initiated several awareness campaigns for the community."
    },
    {
        "name":  "Dr. Subrahmanyam Jaishankar",
        "designation":  "External Affairs Minister, Government of India",
        "category":  "Government",
        "photo":  "Dr. S Jaishankar.jpg",
        "bio":  "Dr. S. Jaishankar is India’s External Affairs Minister since May 30, 2019. He is a Member of the Upper House (Rajya Sabha) of India’s Parliament from the state of Gujarat. He was Foreign Secretary from 2015-18, Ambassador to United States (2013-15), China (2009-2013), Czech Republic (2000-2004); High Commissioner to Singapore (2007-2009). He has also served in other diplomatic assignments in Embassies in Moscow, Colombo, Budapest and Tokyo, as well in the Ministry of External Affairs and the President’s Secretariat. He was also President – Global Corporate Affairs at Tata Sons Private Limited from May 2018. Dr S. Jaishankar is a graduate of St. Stephen’s College at the University of Delhi. He has a Masters in Political Science and an M. Phil and Ph.D in International Relations from Jawaharlal Nehru University, Delhi. He is a recipient of the Padma Shri award in 2019 and has written widely acclaimed best-selling books: The India Way: Strategies for an Uncertain World, which was published in 2020 and Why Bharat Matters, which was published in 2024."
    },
    {
        "name":  "Dylan Schouten",
        "designation":  "Project Manager, GroSafe",
        "category":  "Civil Society",
        "photo":  "Dylan Schouten.jpg",
        "bio":  "Dr. Dylan Gerard Michel Schouten-Adavi is the research project manager for the GroSafe project. He has an interdisciplinary academic/commercial background in human-technology interaction, including a PhD in Interactive Intelligence from Delft University of Technology, combining human-centered research and analysis with technology understanding and design and programming skills. Dylan’s areas of expertise include game research and design, educational research and design, interdisciplinary knowledge transfer and outreach, and employing user-centered and user-driven research to develop and evaluate technological interventions to societal issues. He currently lives in Ireland with his wife and son. Children\u0027s Online Redress (COR) Sandbox: The First Regulatory Sandbox for Online Safety"
    },
    {
        "name":  "Farshida Zafar LL.M.",
        "designation":  "Executive Director, Erasmus Centre for Entrepreneurship; CEO, ROOM",
        "category":  "Academia \u0026 Media",
        "photo":  "Farshida Zafar.png",
        "bio":  "Farshida Zafar LL.M. is Executive Director of the Erasmus Centre for Entrepreneurship, CEO of ROOM, leading strategic initiatives in emerging technology and inclusive entrepreneurship. Her visionary leadership has earned national and international recognition, including the Best Campus Development award (2021), Techionista Tech Leader Award (2018), and SURF innovation award (2016). Named to MT/Sprout’s Inclusive 30 in 2023, she’s recognized as one of the Netherlands’ most influential inclusive leaders. With expertise in law, technology, and change management, Farshida drives digital transformation and leads diverse teams to create innovative solutions with meaningful societal impact."
    },
    {
        "name":  "Garima Saxena",
        "designation":  "Senior Research Associate, The Dialogue",
        "category":  "Civil Society",
        "photo":  "Garima Saxena.png",
        "bio":  "Garima Saxena is a Senior Research Associate at The Dialogue, where she leads research, engagement, and capacity-building efforts, with a focus on internet governance, intermediary liability, and trust and safety. Her work spans regulatory impact assessments, nationwide surveys on tech-facilitated gender-based violence, and rights-based frameworks that inform platform and government decisions. She serves on the Secretariat of the Alliance for Cyber Trust Safety (ACTS), India\u0027s first digital safety alliance. Garima holds a law degree from Rajiv Gandhi National University of Law and is currently researching emerging themes such as AI Trust \u0026 Safety, Age-Assurance Mechanisms, and Content Creator Economy. 7th October 9:00 Welcome - Dome"
    },
    {
        "name":  "Gokul Narayan",
        "designation":  "Chief Executive Officer (CEO) of Asian School of Cyber Laws",
        "category":  "Academia \u0026 Media",
        "photo":  "Gokul Narayan.png",
        "bio":  "Gokul has trained over 100,000 participants, including law students, lawyers, judges, law enforcement officers, chartered accountants, and IT professionals. He has taught at more than 50 prestigious universities and organizations nationwide. Gokul is a respected figure in legal moot courts, mediations, and negotiation competitions, where his insights have shaped the next generation of legal minds. Gokul is currently the Chief Executive Officer (CEO) of Asian School of Cyber Laws."
    },
    {
        "name":  "Hasina Kharbhih",
        "designation":  "Founder, Impulse NGO Network",
        "category":  "Civil Society",
        "photo":  "Hasina Kharbhih.png",
        "bio":  "Hasina Kharbhih, Ashoka Fellow and Aspen Fellow, is the Founder of 37 years Impulse NGO Network and 18 years Impulse Social Enterprises. She created the globally recognized Impulse Model, awarded by the Global Development Network under the World Bank, a single-window strategy technology support Impulse Case Management Centre addressing unsafe migration and human trafficking . Since 1987, her work has tackled exploitation, climate displacement, and promoted resilient markets for indigenous artisans. Her recognitions include the Rising Talent Award (France), IVLP Gold Star (US State Department), Asia Iclif Leadership Energy Award (Malaysia), Mother Teresa Award, and Women Transforming India Award (NITI Aayog). Hasina exemplifies leadership rooted in resilience, purpose, and innovation."
    },
    {
        "name":  "Heena Goswami",
        "designation":  "Editorial Consultant",
        "category":  "Academia \u0026 Media",
        "photo":  "Heena Goswami.png",
        "bio":  "Heena Goswami is a public policy professional focusing on impact of emerging technologies on democratic institutions, society and human development."
    },
    {
        "name":  "Henry Adams",
        "designation":  "Director, T\u0026S at Resolver",
        "category":  "Technology",
        "photo":  "Henry Adams.jpg",
        "bio":  "Henry Adams is Director, Trust \u0026 Safety, at Resolver. He has spent the past decade mitigating risk in diverse, high-harm settings. Henry is a former Head of Intelligence with a background in counter terrorism, national policing operations and crisis negotiation. At Resolver, he initially led global intelligence operations before overseeing the development of predatory network disruption tools. Today, Henry is a member of Resolver\u0027s Trust \u0026 Safety Division leadership and their primary interface with industry, academia, governments and regulators. He is a passionate advocate for the protection of children; and a proponent of the power in taking proactive intelligence-led approaches to safety."
    },
    {
        "name":  "Ioanna Noula",
        "designation":  "Founder and Project Lead, COR Sandbox",
        "category":  "Civil Society",
        "photo":  "Ioanna Noula.jpg",
        "bio":  "Dr Ioanna Noula is the founder and project lead of COR Sandbox, the first regulatory sandbox for online safety upholding children’s rights. She is a senior researcher and advisor in the areas of children’s rights and tech policy. As a trust and safety innovator she co-founded the Internet Commission, a UK-based non-profit organisation that designed and conducted the first ever independent audits of online platforms’ content moderation practices. She has worked as an academic researcher in the UK and is currently a Visiting Fellow at the Centre for Digital Policy at University College Dublin."
    },
    {
        "name":  "Iqra Choudhary",
        "designation":  "Member of Parliament, Kairana, Uttar Pradesh",
        "category":  "Government",
        "photo":  "Iqra Choudhary.jpg",
        "bio":  "Iqra Hasan Choudhary, is one of Lok Sabha’s youngest MPs, elected in 2024, and representing Kairana, Uttar Pradesh, from the Samajwadi Party. A graduate from SOAS University, UK, in international politics and governance, she has emerged as a strong advocate for women’s representation, minority rights, and youth leadership in Parliament. She frequently engages in debates on gender equity and constitutional protections, and is a member of multiple key parliamentary committees like Health and Family Welfare, Estimates, and Empowerment of Women. With her dynamic presence, she is being watched as an influential young leader reshaping inclusive politics in North India."
    },
    {
        "name":  "Japleen Pasricha",
        "designation":  "Founder, CEO and Editor-in-Chief, Feminism in India",
        "category":  "Academia \u0026 Media",
        "photo":  "Japleen Pasricha.jpg",
        "bio":  "Japleen Pasricha is the founder, CEO, and editor-in-chief of Feminism in India, an intersectional feminist media platform that explores the intricacies of culture, politics, society, and media through a feminist lens. She has previously worked with women’s rights NGOs, including Breakthrough India and Point of View, before founding FII in 2014. She is a public speaker and has represented FII on platforms such as the UNCSW, Rights Con, Amnesty International, and the UNHRC, among others. Japleen works to strategically shape FII into a space that presents intersectional feminist information in an accessible way to people of varied palettes and backgrounds, smashing the patriarchy with a vision that emboldens the modern Indian youth."
    },
    {
        "name":  "Jc Le Toquin",
        "designation":  "Co Founder, Trust \u0026 Safety Festival",
        "category":  "Civil Society",
        "photo":  "JC Le Toquin.jpg",
        "bio":  "Jean-Christophe Le Toquin, co-founder of the Trust \u0026 Safety Festival, has a track record in establishing multistakeholder initiatives that strengthen digital safety. His notable achievements include co-founding and developing the annual Trust \u0026 Safety Forum in Europe, INHOPE the global network of frontline services against child sexual abuse material and STISA a survivor-centric network of operational organisations against image-based sexual abuse. He co-founded and chairs the international and cross-disciplinary Cybersecurity Advisors Network (CyAN). He is a former Director of the Digital Crimes Unit at Microsoft EMEA."
    },
    {
        "name":  "Jeff Wu",
        "designation":  "Co- Founder and Chief Safety Officer, K-ID",
        "category":  "Technology",
        "photo":  "Jeff Wu.png",
        "bio":  "Jeff Wu is a Co-Founder and Chief Safety Officer for k-ID, a new technology transforming how kids and teens access age-appropriate experiences. Jeff works with government agencies and safety organizations to support k-ID in providing age-appropriate and region-specific feature access in more than 200 markets around the world as well as building out the Family Platform product. Jeff brings almost two decades of experience in Trust \u0026 Safety, Government Outreach, and Investigations at top technology companies, including pre-IPO hyper growth stages at both Meta Platforms and Google Inc. He has been recognized for his ability to develop government relationships and drive impactful solutions to combat online abuse while delicately balancing community safety and user privacy on a global scale, including his team receiving the prestigious FBI Director’s Award for Excellence in International Operations in 2019."
    },
    {
        "name":  "Jordan Benavidez",
        "designation":  "Director of Safety by Design, Trust \u0026 Safety, Match Group",
        "category":  "Technology",
        "photo":  "Jordan Benavidez.png",
        "bio":  "Jordan Benavidez is a longtime trust and safety professional. She is currently the Director of Safety by Design at Match Group, the parent company of popular services like Tinder, Hinge, and many others, dedicated to helping people around the world build meaningful connections. Previously, Jordan has held trust and safety roles at Spotify, Twitter, and the U.S. National Center for Missing \u0026 Exploited Children. She has particular expertise in the areas of child safety, combatting scaled abuse, responsible AI, and safety by design."
    },
    {
        "name":  "Josephine van Zanten",
        "designation":  "Second Secretary Political Affairs \u0026 Human Rights, Netherlands Embassy",
        "category":  "International",
        "photo":  "Josephine van Zanten.jpg",
        "bio":  "Josephine works as Second Secretary at the Political Department of the Embassy of the Kingdom of the Netherlands in India, where she is responsible for the Embassy’s human rights portfolio among other files. Prior to her posting in Delhi, she was desk officer for Suriname and Guyana at the Ministry of Foreign Affairs in The Hague. Before joining the Dutch diplomatic corps, she served as a Climate and Security Risk Expert with UNDP in Burkina Faso and worked with NGOs in Myanmar. She holds a Master of Social Sciences in Peace and Conflict Studies from Uppsala University, Sweden."
    },
    {
        "name":  "Jyoti Vadehra",
        "designation":  "Head, Online Safety and Wellbeing, CSR India",
        "category":  "Civil Society",
        "photo":  "Jyoti Vadehra.jpg",
        "bio":  "Jyoti Vadehra is the Lead Digital Trust and Safety, CSR and founding secretariat of the Alliance for Cyber Trust and Safety (ACTS). A strategic expert in the field, she specializes in online safety and wellbeing, and the design and execution of large-scale online safety projects. Jyoti spearheaded the formation of the ACTS alliance and is dedicated to fostering a safer digital ecosystem at the nexus of Gen AI, child safety and wellbeing, gender equality, and sustainable development. Her experience includes significant contributions to policy advocacy, and she is the first Indian representative on Meta’s Board of Global Women’s Safety Expert Advisors."
    },
    {
        "name":  "Kanta Singh",
        "designation":  "Country Representative, a.i. - UN Women India Country Office",
        "category":  "Civil Society",
        "photo":  "Kanta Singh.jpg",
        "bio":  "Kanta Singh brings over 25 years of experience in managing pro-women development programmes. She has worked with national and international organizations to advance women’s participation in the formal economy, sports, and political leadership. Prior to joining UN Women, she served with the United Nations Development Programme (UNDP) for nine years. She currently serves as the Country Representative, a.i. at UN Women India Country Office.A former national-level volleyball player, Kanta is also a Chevening Gurukul Fellow from the University of Oxford."
    },
    {
        "name":  "Karuna Nain",
        "designation":  "Online Safety Expert/ Advisor, Centre for Social Research",
        "category":  "Civil Society",
        "photo":  "Karuna Nain.jpg",
        "bio":  "Karuna Nain is a global online safety expert with two decades’ experience in technology policy, safety strategy, government affairs and communications. She advises technology companies, non-profits and governments on building safer digital ecosystems through practical policy, product design and stakeholder engagement. Karuna spent a decade at Meta and served as Global Safety Policy Director, leading work on child safety and well-being, women’s safety and suicide prevention. She co-founded StopNCII.org with UK charity SWGfL and serves on its Board of Trustees."
    },
    {
        "name":  "Kavita Ayyigari",
        "designation":  "Country Director India, Girl Effect",
        "category":  "Civil Society",
        "photo":  "Kavita Ayyigari.jpg",
        "bio":  "Kavita Ayyagari is the Country Director for Girl Effect India. She leads Girl Effect’s Chaa Jaa (Go forth and shine) Initiative that aims to improve girls\u0027 health, education, and livelihoods by connecting them to life-changing information and resources. And helps girls stay in school, get vaccinated, be healthy and thrive. Kavita has over two decades of experience in public health, leading high-impact projects in adolescent sexual and reproductive health, immunization, tuberculosis, and new born child survival. Before joining Girl Effect, Kavita was the Country Director for Howard Delafield International’s Game of Choice, Not Chance, a pioneering gaming initiative designed to empower adolescent girls through play. She has led Pathfinder International\u0027s Youth Voices for Agency and Access (Yuvaa) and the Union\u0027s flagship Challenge TB Program for raising political will and action on tuberculosis. Kavita is passionate about ensuring girls have the tools to shape their futures and realize their dreams."
    },
    {
        "name":  "Kazim Rizvi",
        "designation":  "Founding Director, The Dialogue",
        "category":  "Civil Society",
        "photo":  "Kazim Rizvi.jpg",
        "bio":  "Kazim Rizvi is the Founding Director of The Dialogue, a New Delhi-based public policy think-tank. A prominent voice in India’s tech policy landscape, he works at the intersection of technology, policy, and society, with expertise in AI, data protection, and cybersecurity among others. He champions evidence-based research and collaborative governance through key multi-stakeholder initiatives: the Coalition for Responsible Evolution of AI (CoRE-AI) on AI governance, Strategic Research, Innovation \u0026 Dialogue for EU-India Engagement (STRIDE-EUI) for India-EU cooperation, and the Alliance for Cyber Trust and Safety (ACTS), co-founded with CSR India to strengthen online safety, counter misinformation, and build digital trust."
    },
    {
        "name":  "Kriti Trehan",
        "designation":  "Founder, Data \u0026 Co - Law \u0026 Policy Advisors",
        "category":  "Civil Society",
        "photo":  "Kriti Trehan.png",
        "bio":  "Kriti Trehan is a seasoned tech policy advisor with over a decade of experience in shaping regulation across privacy, digital payments, platform governance, online safety, and AI. She has led tech policy and regulatory strategy at global tech giants like Netflix and Amazon, built and scaled tech law and policy practices at top-tier law firms, and now helms her own consultancy, Data \u0026 Co - Law \u0026 Policy Advisors. Based in New Delhi, Kriti advises companies, industry associations, and civil society around the world on emerging tech regulation, bridging commercial needs with responsible innovation and global trends. Outside of work, Kriti enjoys immersing herself in new cultures and cuisines, writing light-hearted poetry, and spending time with Data, the dog."
    },
    {
        "name":  "Kundan Mishra",
        "designation":  "Senior Program Officer, International Development Research Centre (IDRC)",
        "category":  "Civil Society",
        "photo":  "Kundan Mishra.png",
        "bio":  "Kundan is a Senior Program Officer at IDRC in the Democratic and Inclusive Governance division. His work focuses on strengthening civic space, information integrity, forced migration, and climate crisis in Asia."
    },
    {
        "name":  "Laxmi",
        "designation":  "Co-Producer, Khabar Lahariya",
        "category":  "Academia \u0026 Media",
        "photo":  "Laxmi.jpg",
        "bio":  "A native of Madhopur Chhata village, from the Sheohar district of Bihar, Lakshmi joined Khabar Lahariya in 2010 as a reporter. She went on to run the Bihar edition of the Khabar Lahariya print newspaper before moving onto the production side of things in the Delhi newsroom, where she headed the production desk and became Senior Producer at KL in 2015. Since 2019, Lakshmi has moved up to the core leadership at Chambal Media, where she currently leads the production as senior producer of special features, including shorts, documentaries, podcasts, and animations."
    },
    {
        "name":  "Lena Dasgupta Basu",
        "designation":  "Programme Manager, Child Protection, Child in Need Institute (CINI)",
        "category":  "Civil Society",
        "photo":  "Lena Dasgupta Basu.jpg",
        "bio":  "Lena is a dynamic development sector professional, leading the Child Protection Portfolio in Child in Need Institute (CINI) India. She has experience of 21 years. She served as Senior Programme Coordinator in Childline India Foundation (CIF) for sixteen years. Facilitating dialogue with the Government and CSOs, to consolidate the private public partnership and to deliver the service to children in the field was her main role in ChildLine. She did her Masters in Sociology from Calcutta University and worked with CSOs, implementing projects on Cross Border Trafficking, Child Marriage, Child Labour in rural and urban parts of West Bengal."
    },
    {
        "name":  "Manisha Kapoor, CEO of Advertising Standards Council of India",
        "designation":  "Manisha is the CEO and Secretary-General of The Advertising Standards Council of India.",
        "category":  "Civil Society",
        "photo":  "Manisha Kapoor.png",
        "bio":  "Manisha also serves as one of 4 global vice presidents on the executive committee of the International Council for Ad Self-Regulation (ICAS). Manisha brings with her more than 25 years of brand building and marketing experience, working in large organisations across sectors. Since taking over the helm at ASCI, Manisha has been at the forefront of transforming the organisation into a future ready entity that works collaboratively with different stakeholders to protect the rights of consumers. She has been instrumental in ensuring that advertising self-regulation keeps pace with the fast evolving landscape."
    },
    {
        "name":  "Mitthat Hora",
        "designation":  "Program Officer, British Asia Trust",
        "category":  "Civil Society",
        "photo":  "Mitthat Hora.jpg",
        "bio":  "With a Master’s in Social Work specialising in Criminology and Justice from the Tata Institute of Social Sciences (TISS), Mumbai, Mitthat has over five years of experience in the development sector, focusing on gender and child rights. She has worked across themes including domestic violence, women undertrials, and child protection. She has worked with marginalised communities involved in inter-generational sex work, supporting community development through initiatives in education and livelihood. As a Child Rights Fellow with the Delhi Commission for Protection of Child Rights (DCPCR) and Ashoka University, she led key projects for the Delhi Government on child well-being and care for children in street situations. Currently, at the British Asian Trust, Mitthat works in the Child Protection team, focusing on strategy and communications."
    },
    {
        "name":  "N.S. Nappinai",
        "designation":  "Senior Advocate, Supreme Court and Founder, CyberSaathi",
        "category":  "Civil Society",
        "photo":  "N.S. Nappinai.png",
        "bio":  "N.S. Nappinai, Senior Advocate at the Supreme Court of India, is a trailblazing cyber law expert with over 32 years of practice since 1991. She is also a prolific writer and authored ‘Technology Laws Decoded,’ (2017) and serving as amicus curiae in landmark cases on child pornography and electronic evidence. A global fellow at Stanford and Cranfield Universities, she has trained judiciary and police on cybercrimes. As Founder of Cyber Saathi, empowering women and children-with free resources on cyber safety, privacy rights, and remedies under the IT Act, fostering a secure Digital India."
    },
    {
        "name":  "Nandita Baruah",
        "designation":  "Country Representative - India, The Asia Foundation",
        "category":  "Civil Society",
        "photo":  "Nandita Baruah.jpg",
        "bio":  "Nandita Baruah has over 35 years of experience working in the development sector in Asia. She is the Country Representative - India at The Asia Foundation. She has served in leadership positions in the Asia Foundation\u0027s country offices in Cambodia and Nepal. Nandita has held senior technical and leadership positions with several multilateral and bilateral development agencies across South Asia, including UNODC, UNWomen, CIDA, and USAID. Her portfolio of engagement spans gender-based violence, feminist foreign policy, human trafficking, migration and mobility, governance, climate and environmental resilience, digital literacy and workforce development."
    },
    {
        "name":  "Natasha Jog",
        "designation":  "Director, Public Policy, Meta India",
        "category":  "Technology",
        "photo":  "Natasha Jog.png",
        "bio":  "Natasha Jog, is Director, Public Policy at Meta. In her role she leads public policy for Instagram and oversees all the programmatic initiatives and outreach for Meta. This covers sectors like AI, small businesses and ways we can empower them youth, safety and integrity etc. Prior to joining Meta, Natasha was with NDTV, where she anchored prime time analysis shows and reported extensively from across the country for a decade and a half. She has been a speaker at multiple events and industry summits on issues ranging from impact of new digital technologies on India to tech policies and more."
    },
    {
        "name":  "Neda Niazian",
        "designation":  "Group Director Trust \u0026 Safety - Booking.com",
        "category":  "Technology",
        "photo":  "Neda Niazian.jpg",
        "bio":  "“My mission is to inspire and empower people and organizations to turn bold visions into reality.” Strategic and transformational executive leader with over 15 years of global experience at the intersection of Technology, Innovation and Operational Excellence. Proven track record in shaping long-term strategy, leading complex cross-functional transformations, and aligning technology and data capabilities with business objectives, all while navigating regulatory, compliance, and reputational risk. Currently leading Global Trust \u0026 Safety for Booking.com and Booking Holdings, overseeing multidisciplinary teams across Security Operations, Product, AI \u0026 Machine Learning, Software Development, Data Science and Risk \u0026 Compliance."
    },
    {
        "name":  "Neha Agrawal",
        "designation":  "Founder, Mathematically Inclined",
        "category":  "Academia \u0026 Media",
        "photo":  "Neha Agrawal.jpg",
        "bio":  "Neha Agrawal is one of India\u0027s celebrated Math educators for IIT-JEE and engineering entrances, with over 17 years of teaching experience. She is also the founder of Mathematically Inclined, her YouTube channel has empowered 5 million+ students, amassing 1.7M+ subscribers and 270M+ views - all built single-handedly. Further, she has been honored by India\u0027s HRD Minister and featured in The Hindu Business Line, ThePrint, and Oxford Economics. She is a recognized force in revolutionizing Math education, a 5X TEDx Speaker, and keynote speaker at top IITs/NITs/IIITs."
    },
    {
        "name":  "Nick Dale",
        "designation":  "Director of Intelligence, Stop The Traffik",
        "category":  "Civil Society",
        "photo":  "Nick Dale.jpg",
        "bio":  "Nick served over two decades with West Midlands Police in the United Kingdom. For the past 10 years of his career, through multiple roles in investigation, local policing and intelligence, Nick consistently focused on organised exploitation, sexual exploitation, and county lines trafficking. Through this time, Nick led Operation Fort, the largest human trafficking investigation in UK history, and championed the use of data analytics tools to streamline intelligence and investigations in the fight against traffickers. In October 2024, Nick took on a new challenge outside policing, as Director of Intelligence for global human trafficking charity STOP THE TRAFFIK."
    },
    {
        "name":  "Nikhil Taneja",
        "designation":  "Co-Founder/Chief, Yuvaa",
        "category":  "Academia \u0026 Media",
        "photo":  "Nikhil Taneja.jpg",
        "bio":  "Nikhil Taneja is a multi-award winning writer, producer, podcaster, entrepreneur, mental health \u0026 gender equality advocate and most importantly, a girl dad. He’s the co-founder and Chief of Yuvaa, India’s first Gen Z-driven youth media, research and impact organization. He also serves on the Board of Directors of the girls’ education focused international non-profit, Girl Rising. Nikhil is also the creator and host of ‘Be A Man, Yaar!’, the viral Indian chat series on positive masculinity. Nikhil is a proud Special Jury Awardee of the Kamla Bhasin Award 2024 for enabling a gender-just ecosystem across South Asia. He also won the Laadli Foundation Media Award for Gender Sensitivity in 2024."
    },
    {
        "name":  "Nilanjana Bhowmik",
        "designation":  "Journalist",
        "category":  "Academia \u0026 Media",
        "photo":  "Nilanjana Bhowmik.jpg",
        "bio":  "Nilanjana Bhowmick is a seasoned journalist, feminist writer, and TEDx speaker whose work focuses on gender equality and social justice. She is the author of two popular and critically acclaimed books on the lives of modern Indian women. Nilanjana has also partnered with UN Women and UNDP India on women’s rights campaigns, founded Wednesday Online, a platform dedicated to empowering women through knowledge and information, and was selected for the UN Women AI School 2025 cohort, where she created an AI tool to detect gender bias in language."
    },
    {
        "name":  "Norman Ng",
        "designation":  "Head, Trust \u0026 Safety Global Engagement, Google",
        "category":  "Technology",
        "photo":  "Norman Ng.png",
        "bio":  "Norman is Google APAC’s Head of Trust \u0026 Safety Global Engagements. As a global affairs leader under Google’s trust and safety team, Norman leads a long term engagement strategy on online and content safety with policymakers, online safety experts, industry leaders and civil society experts. These encompass areas including AI responsibility and safety, youth \u0026 family online safety, content moderation, misinformation, elections integrity and online fraud and scams. Norman’s career spanned leadership roles in industries across technology, venture capital, startup and government. He currently serves as a board member in the Global Anti-Scam Alliance’s Singapore and Philippines chapter and as an advisor to the Intellectual Property Office of Singapore (IPOS) Society."
    },
    {
        "name":  "Prakshi Saha, Founder, Frida Health",
        "designation":  "Prakshi Saha is the Founder of Frida- Women’s Health Advocacy Lab where they work on",
        "category":  "Civil Society",
        "photo":  "Prakshi Saha.jpg",
        "bio":  "health, well-being and dignity of adolescent girls and women. They have launched India’s first ever Parliamentarians’ Forum on Women’s Health. Prakshi is a lawyer by academic degree and has primarily worked as a policy researcher with Parliamentarians, governments, and think tanks. She also currently manages outreach, partnerships and stakeholder engagement at The Asian Collective for Health Systems comprising 10 South And Southeast Asian countries, prioritising the Asian voice in global health governance. She started her journey in the social impact space at 18. She has run numerous campaigns, and petitions engaging more than 1,00,000 citizens and elected representatives and directly worked with 5000+ women and girls from grassroots communities."
    },
    {
        "name":  "Rajesh Ranjan",
        "designation":  "Head of Core Government Affairs and Public Policy, Google India",
        "category":  "Technology",
        "photo":  "Rajesh Ranjan.jpg",
        "bio":  "Rajesh leads Google’s strategic engagement with India\u0027s Central and State Governments. With over 20 years of experience spanning the public and private sectors, he has been instrumental in shaping major national policies. He has advised government leaders on critical areas like Data Privacy, Cloud, and Electronics Policy, while also managing large-scale IT implementation and public procurement projects. His previous roles at Microsoft, KPMG, and with the CAG of India provide him with deep insights into India’s civic, political, and economic landscape. Rajesh holds a Bachelor\u0027s in IT and a Master’s in International Business."
    },
    {
        "name":  "Rakesh Maheshwari",
        "designation":  "Fmr Senior Director (Retd.), Ministry of Information Technology, Government of India",
        "category":  "Government",
        "photo":  "Rakesh Maheshwari.jpg",
        "bio":  "Rakesh Maheshwari is a former Government Officer having worked for more than 35 years in Ministry of Electronics and Information Technology (MeitY) and retired as Sr. Director and Group Coordinator, Cyber Law and data Governance. He had also been Group Co-ordinator Cyber Security and CERT-In in the Ministry. He is an Engineer in Electronics and Comm from Delhi College of Engg. He handled activities related to Information Technology (IT) Act, Cyber Security policies, Social media regulation, Personal data protection Bill, in various capacities including as Group Co-ordinator (GC) Cyber Law, GC Cyber Security, GC for CERT-In, GC for UIDAI and Designated Officer for section 69A of IT Act. He was closely associated with the drafting and implementation of various regulations governing India’s online space."
    },
    {
        "name":  "Rohit Kumar",
        "designation":  "Co-Founder, The Quantum Hub",
        "category":  "Civil Society",
        "photo":  "Rohit Kumar.png",
        "bio":  "Rohit is the co-founder of The Quantum Hub (TQH). TQH is a multi-sectoral public policy firm working across technology, telecom, sustainability, gender, and social inclusion. His expertise spans regulation of new business models and emerging issues in tech policy, including intermediary liability, speech regulation, and AI. An alumnus of Harvard Kennedy School and IIT Bombay, he previously served as Head of Policy \u0026 Research to Member of Parliament Mr. Baijayant ‘Jay’ Panda and worked at PRS Legislative Research, supporting MPs across parties on legislative matters."
    },
    {
        "name":  "Sachee Malhotra",
        "designation":  "Co Founder, That Sassy Thing",
        "category":  "Civil Society",
        "photo":  "Sachee Malhotra.jpg",
        "bio":  "Sachee (she/her) is the co-founder of That Sassy Thing, a feminist, new-age sexual wellness brand for women. Having worked across sexual wellness brands in India and the US, Sachee realised how the space was dominated by men, with products designed for men and conversations primarily aimed at them. That Sassy Thing is here to change that and revolutionise the sexual wellness space with a Sex-Ed first approach. She started the brand because of her personal struggles dealing with PCOS (Polycystic Ovarian Syndrome) for 15 years. When she couldn’t find products that were good for her body, she decided to create her own natural, body-safe sexual wellness products. She believes in bringing the much-needed equality and education for women in the bedroom, and making women’s pleasure shame-free and fun."
    },
    {
        "name":  "Sadhna Singh",
        "designation":  "Consultant, Niti Ayog",
        "category":  "Government",
        "photo":  "Sadhna Singh.jpg",
        "bio":  "Sadhna Singh is a Consultant at NITI Aayog, bringing over a decade of cross-sector experience in policy research, strategic affairs, cybersecurity, and stakeholder engagement. Her work focuses on driving impactful policy initiatives aligned with India\u0027s development goals, particularly in the domains of ICT, national security, and governance.A former officer in the Indian Army’s Corps of Signals, Sadhna brings mission-driven discipline and deep expertise in network administration and secure communications. Her combined military and policy experience enables her to navigate complex challenges with strategic foresight and deliver actionable, system-level solutions.She has been recognized with several prestigious honours, including Security Professional of the Year 2024, Business World Security 40 Under 40, and the Lady Leadership Award by CAPSI. Passionate about fostering collaboration, driving innovation, and contributing to inclusive and resilient national growth, Sadhna continues to champion initiatives that strengthen India’s strategic and cybersecurity posture."
    },
    {
        "name":  "Seema Jindal",
        "designation":  "Head of Public Affairs, Truecaller",
        "category":  "Technology",
        "photo":  "Seema Jindal.png",
        "bio":  "Seema Jindal is Head of Public Affairs at Tuecaller, where she leads engagement with policymakers, regulators, and industry bodies to strengthen the company’s role in shaping India’s digital ecosystem infusing trust and safety in the digital communications. With over 25 years of experience, she previously held leadership roles at Airtel, driving regulatory policy, strategy, interconnection, compliance, and audit across the telecom, satellite and broadcasting verticals. Most notably, she spearheaded the implementation of India’s pioneering regulatory framework to curb telecom spam using Digital Ledger Technology (DLT). At Truecaller, she champions innovation and transparency while fostering strong partnerships with government and industry stakeholders to build secure, trusted, and future-ready communications for millions of users. As India’s digital economy expands at an unprecedented pace, she advocates for close collaboration between industry and government to create a safe, inclusive, and trustworthy digital ecosystem. P K Singh Additional Secretary, TRAI"
    },
    {
        "name":  "Shanley Clemot McLaren",
        "designation":  "Feminist Activist and Global Expert on Gender Digital Rights, United Nations Young Activist",
        "category":  "International",
        "photo":  "Shanley Clemot McLaren.jpg",
        "bio":  "Laureate, Founder of #StopFisha. Shanley Clemot McLaren founded #StopFisha, one of the world’s first organizations against online gender-based violence. She has shaped national, European, and international policies, contributing to the EU’s Digital Services Act, AI Act, and Directive on violence against women, as well as France’s SREN Law. From 2023 to 2025, as Gender and Digital Policy Advisor at France’s Ministry for Europe and Foreign Affairs, she shaped the Laboratory for women\u0027s rights online - the first international and multistakeholder platform dedicated to find transnational solutions against online and technology- facilitated gender-based violence. She also spearheaded initiatives at the AI Action Summit and the United Nations, securing groundbreaking commitments on gender equality and AI."
    },
    {
        "name":  "Shantaram Jonnalagadda",
        "designation":  "Director, Yoti",
        "category":  "Technology",
        "photo":  "Shantaram Jonnalagadda.png",
        "bio":  "Mr. Shantaram Jonnalagadda, Director at Yoti Biometric Identity Pvt. Ltd., is a visionary leader in digital identity and transformation with over 28 years of global expertise. Appointed Country Head for Yoti India in 2018, he propelled the UK-based privacy-centric digital ID platform\u0027s expansion, fostering secure verification for BFSI and fintech sectors. His career spans 14 years at Infosys, entrepreneurial stints in e-commerce and agriculture, and roles at UST and Algonomy. He is also the co-founder and CEO of Nirvay, a consulting firm providing services around Go-To-Market, Strategy, Innovation, Global Competency Centers, Experience Design, Product and Technology."
    },
    {
        "name":  "Shilpi Singh",
        "designation":  "Gurgaon Moms",
        "category":  "Civil Society",
        "photo":  "Shilpi Singh.jpg",
        "bio":  "Shilpi is a Leadership Coach who works extensively with women navigating their leadership journeys and aspirations. She is the Co-founder of Studio4, a leadership and communication agency that enables leaders and organizations to build authentic presence, influence, and sustainable impact. Shilpi is also the Co-founder of Unhotel Global, an experiential travel company curating unique, bespoke journeys rooted in sustainable and responsible travel. Unhotel goes beyond conventional itineraries to help travelers experience the true essence of a place, its people, culture, and stories while creating meaningful connections and ensuring positive impact on local communities."
    },
    {
        "name":  "Shireen Vakil",
        "designation":  "Child Rights Advocate",
        "category":  "Civil Society",
        "photo":  "Shireen Vakil.jpg",
        "bio":  "Shireen Vakil is a distinguished policy and advocacy leader with expertise in child protection, gender and education. She served as Head of Safety Policy for Asia Pacific at Meta, where she focused on online child protection, women’s safety, and youth mental well-being. Prior to that, she led the Policy and Advocacy unit at Tata Trusts, and played a pivotal role as the Director of Advocacy, Campaigns, and Communications at Save the Children India, including working with the MWCD and UNICEF on the first National level Child Abuse study (2007). Most recently, Shireen led the Child Opportunity Fund, a bold 10-year, multi-million-dollar joint initiative between the British Asian Trust and the Children’s Investment Fund Foundation focused on child protection. Ms Vakil comes with strong experience in building multi-stakeholder partnerships, addressing national and global issues with governments, donors, civil society and the media and has appeared and written on a spectrum of child rights and gender issues, in national and international media."
    },
    {
        "name":  "Shohini Banerjee",
        "designation":  "Knowledge Specialist, Point of View",
        "category":  "Civil Society",
        "photo":  "Shohini Banerjee.png",
        "bio":  "Shohini has spent the last decade working on addressing gender-based violence through prevention and response programming. More recently, her work has been focused on the intersection of gender and technology, including efforts to prevent and respond to technology-facilitated gender based violence. She is currently the knowledge specialist at Point of View."
    },
    {
        "name":  "Shri Ashwini Vaishnaw",
        "designation":  "Hon\u0027ble Minister for Railways; Information \u0026 Broadcasting; Electronics \u0026 Information",
        "category":  "Government",
        "photo":  "Shri Ashwini Vaishnaw.jpg",
        "bio":  "Technology, Government of India Shri Ashwini Vaishnaw (born in 1970) is a Member of Rajya Sabha from Odisha. He served the people of Sundergarh, Balasore, Cuttack and Goa. He earned Master’s in Technology from IIT Kanpur and MBA from Wharton. He brings a combination of skills in technology, finance and its application to weakest sections of society. He firmly believes in the philosophy of ‘Antyodaya’, i.e. transforming the lives of the marginalized sections of society."
    },
    {
        "name":  "Siddharth P.",
        "designation":  "Co-Founder \u0026 Director, RATI Foundation",
        "category":  "Civil Society",
        "photo":  "Siddharth P..jpg",
        "bio":  "Siddharth has over 15 years of experience in nonprofit work across India, with expertise in digital safety, research, and advocacy. He co-founded RATI Foundation and the Aarambh India Initiative, which received the Presidential National Award in 2017 for pioneering CSAM reporting in India. At RATI, he leads online safety strategy and co-created initiatives like Meri Trustline, an award-winning national helpline for victims of online abuse, and Ideal Internet Researchers, exploring children’s digital lives. He has worked with the Union Ministry of Women \u0026 Child Development, UNESCO Asia-Pacific, and ECPAT-India on online child safety frameworks. Earlier, he worked on campaigns with Video Volunteers and Red Cross Hunger Videos."
    },
    {
        "name":  "Smt. Annapurna Devi",
        "designation":  "Hon’ble Union Cabinet Minister of Women \u0026 Child Development, Government of India",
        "category":  "Government",
        "photo":  "Smt. Annapurna Devi.jpg",
        "bio":  "Annpurna Devi is the Minister of Women and Child Development of India. She was elected to the Bihar Legislative Assembly in 1998, 2000 and 2005. She held the positions of Minister of State for Ministry of Mines and Geology, Government of Bihar in 2000 and Cabinet Minister, Ministry of Irrigation, Women and Child Welfare, Registration, Government of Jharkhand during 2012-2014. She was elected as Member of Parliament to 17th Lok Sabha in 2019. She held the position as Union Minister of State, Ministry of Education from July, 2021 onwards. She headed an expert committee on Revision of RTE (Right to Education) in view of National Education Policy 2020. ln the 2024 General Elections, she has been re-elected to the Lok Sabha from Koderma Parliamentary Constituency in Jharkhand. She also functioned as Chairperson, Committee on Women \u0026 Child Welfare, Jharkhand Legislative Assembly during 2005-2009. She was Member, Committee on Empowerment of Women and also Member, Consultative Committee, Ministry of Power and Ministry of New and Renewable Energy from 2019 to 2021. She is a Post Graduate from Ranchi University."
    },
    {
        "name":  "Snigdha Bhardwaj",
        "designation":  "Director and Global Head of Generative AI, Trust \u0026 Safety, Google",
        "category":  "Technology",
        "photo":  "Snigdha Bhardwaj.jpg",
        "bio":  "A transformational leader with a 17+ years of experience and strong background in Trust and Safety, currently driving Generative AI testing and enforcement strategy for consumer products in Google. Snigdha has been instrumental in setting the framework and direction for key \u0026 novel Google launches, including Gemini, Search launches like AIO \u0026 AIM. Snigdha\u0027s expertise includes developing robust strategies for content and actor-based abuse in Generative AI, with a focus on trust \u0026 info quality. Also championing key strategic priorities including implementation \u0026 resource allocation for Generative AI launches, advocating for xT\u0026S resourcing to SVPs to ensure successful pre and post launch support."
    },
    {
        "name":  "Sophie Mortimer",
        "designation":  "Manager, UK Revenge Porn Helpline at SWGfL",
        "category":  "Civil Society",
        "photo":  "Sophie Mortimer.jpg",
        "bio":  "Sophie Mortimer is the manager of the UK Revenge Porn Helpline supporting adults affected by intimate image abuse. She is also part of the team supporting the StopNCII.org platform which allows any adult around the world to protect their own images from sharing and resharing across partner platforms. Sophie participates in events in both the UK and globally to raise awareness of intimate image abuse and the help that is available to support survivors. She is a keen proponent of the importance of collaboration across jurisdictional boundaries as a key element in finding solutions to online abuse."
    },
    {
        "name":  "Steven Biddle",
        "designation":  "Minister Counsellor, Department of Home Affairs, Australian High Commission",
        "category":  "International",
        "photo":  "Steven Biddle.png",
        "bio":  "Steven Biddle has been working as the Minister Counsellor for the Department of Home Affairs since February 2024. Steven has regional responsibility for the Department’s remit in India, Bangladesh, Bhutan, Maldives, Nepal and Sri Lanka. Steven is responsible for helping to build greater cybersecurity cooperation between Australia and South Asian Countries. Steven’s previous assignments include working as the Assistant Secretary for Privacy, freedom of Information and Records Management, Regional Manager for Compliance, Status Resolution and Detention Operations and Regional Director of Queensland for the Department of Home Affairs. Steven has also led Australia’s settlement program for new migrants and refugees."
    },
    {
        "name":  "Sumeysh Srivastava",
        "designation":  "Associate Director, The Quantum Hub",
        "category":  "Civil Society",
        "photo":  "Sumeysh Srivastava.jpg",
        "bio":  "Sumeysh is Associate Director at The Quantum Hub, where he leads work on telecom regulation, digital infrastructure, and emerging technology policy. He has worked extensively on issues such as spam regulation, CNAP, trusted network frameworks, and the evolving policy landscape around telecom fraud. At TQH, he advises global platforms and telecom-facing applications on navigating regulatory responses and shaping inputs to public consultations in India’s digital economy. His expertise lies in bridging complex regulatory frameworks with practical policy solutions for the telecom and technology sectors."
    },
    {
        "name":  "Sunil Abraham",
        "designation":  "Public Policy Director, Data Economy and Emerging Tech, Meta, India",
        "category":  "Technology",
        "photo":  "Sunil Abraham.jpg",
        "bio":  "Sunil Abraham is Director of Public Policy for Data and Emerging Tech at Meta India, where he leads engagement on privacy, consumer protection, and AI-driven innovation. He co-founded Mahiti Infotech and the Centre for Internet and Society and has been a vocal advocate for open-source software, digital inclusion, and the Wikimedia movement. Sunil has also taught globally, serving as an endowed professor at ArtEZ University of the Arts in the Netherlands."
    },
    {
        "name":  "Swati Chawla",
        "designation":  "Director of Global Operational Wellness, TP",
        "category":  "Technology",
        "photo":  "Swati Chawla.png",
        "bio":  "Swati Chawla is the Director of Global Operational Wellness at Teleperformance. She leads the implementation of wellness strategies that support trust and safety professionals globally. With over two decades of experience in organizational psychology and wellness, Swati has built scalable frameworks that strengthen resilience, improve employee wellness, and enable sustainable performance in high-intensity trust \u0026 safety environments. Her work focuses on establishing measurable outcomes, and fostering a culture of inclusion and psychological safety. Recognized for her contributions to workplace health, Swati has received multiple industry awards.She holds a Master’s in Psychology and Sociology."
    },
    {
        "name":  "Uma Subramanian",
        "designation":  "Co-Founder \u0026 Director, RATI Foundation",
        "category":  "Civil Society",
        "photo":  "Uma Subramanian.jpg",
        "bio":  "Uma is a social worker \u0026 specialist in child protection and women’s rights with over 15 years of experience in grassroots intervention, survivor support, and systems advocacy. She co-founded RATI Foundation and the Aarambh India Initiative, which received the Presidential National Award in 2017 for pioneering CSAM reporting in India. At RATI, she leads victim-centric responses to gender-based violence online and on-ground, engages in government advocacy, and drives program implementation. A master trainer in child protection, she has trained more than 2,000 stakeholders nationwide. Uma was recognized as an ‘Agent of Change’ by the Ministry of Women \u0026 Child Development ,Government of India."
    },
    {
        "name":  "Uthara Ganesh",
        "designation":  "Head of Public Policy, India and South Asia, Snap Inc.",
        "category":  "Technology",
        "photo":  "Uthara Ganesh.jpg",
        "bio":  "Uthara Ganesh is Head of Public Policy, India and South Asia at Snap Inc. She focuses on developing Snap\u0027s relationships with key government agencies in South Asia and shaping regulatory outcomes in areas such as content regulation, data protection and privacy, emerging tech regulation, and competition. Prior to this role, Uthara led Amazon Web Services\u0027 (AWS) and Amazon\u0027s public policy efforts, supporting advocacy on content regulation, taxation, data governance, and competition issues across Prime Video, Kindle, Alexa, and Cloud businesses. She also served as Public Policy Lead to Rajeev Chandrasekhar from 2014 to 2017 and has worked at the Centre for Policy Research, UNAIDS, and GIZ. Uthara was a LAMP Fellow from 2010 to 2011."
    },
    {
        "name":  "Vaishnavi J",
        "designation":  "Founder, Vys",
        "category":  "Civil Society",
        "photo":  "Vaishnavi J.jpg",
        "bio":  "Vaishnavi is the founder and principal of Vyanams Strategies (Vys), helping companies, civil society, and governments build healthier online communities for young people. Vys leverages extensive industry experience at leading technology companies to develop tactical product and policy solutions for child safety and privacy. An expert in online child safety, privacy, and age-appropriate design, Vaishnavi was previously the head of youth policy at Meta, supporting age-appropriate design across Instagram, Facebook, VR, and messaging services. She previously led Twitter’s video content policies, was their first head of safety in APAC, and served as Google’s central child safety policy lead for APAC"
    },
    {
        "name":  "Vidushi Chaturvedi",
        "designation":  "Lead Architect, Frontier Tech Hub, Niti Ayog",
        "category":  "Government",
        "photo":  "Vidushi Chaturvedi.jpg",
        "bio":  "Vidushi Chaturvedi is Lead Architect at NITI Aayog’s Frontier Tech Hub, where she advances India’s readiness for frontier technologies including AI, quantum, and biotech. With over 25 years in the Indian Civil Service and public policy, she works across government, academia, and industry to build frameworks that harness emerging technologies for inclusive growth and resilience. She has published on Feminist Ethics and AI in the Handbook of Global Philosophies on AI Ethics: Towards Sustainable Futures and contributed invited entries on Gender and AI and India: Overview of Regulatory Regime for AI in the Edward Elgar Encyclopedia on AI. Vidushi has an LLM in Technology, Innovation and Entrepreneurship from Seattle University School of Law and a PhD in International Politics. FBI USA"
    },
    {
        "name":  "Vithika Yadav",
        "designation":  "Former Head, Love Matters India",
        "category":  "Civil Society",
        "photo":  "Vithika Yadav.jpg",
        "bio":  "Vithika Yadav is a social entrepreneur with over 20 years of experience in gender rights, sexual rights, and anti-slavery work. Vithika co-founded Love Matters, India’s first digital platform on sexual and reproductive health, and founded TeenBook, a life skills hub for adolescents. She chairs the Global Advisory Board on Sexual Health and Well-being. A recognized global leader, she has received multiple honors including the 120 Under 40 award by the Gates Institute and the Atlas Corps Fellowship. Vithika has worked with the UN, BBC, Free the Slaves, and MTV EXIT, and is featured in the documentary #FemalePleasure. She is an alumna of Lady Shri Ram College and THNK School of Creative Leadership. Currently, she is the Managing Director of Designathon Works, empowering children in 50+ countries to become changemakers, and serves as a Child Protection Expert with the Purple Foundation."
    },
    {
        "name":  "Vrinda Bhandari",
        "designation":  "Advocate, Supreme Court of India",
        "category":  "Civil Society",
        "photo":  "Vrinda Bhandari.png",
        "bio":  "Vrinda is a Rhodes Scholar, who graduated from the University of Oxford with a double Masters in Law and Public Policy, and received her undergraduate law degree from NLSIU Bangalore. She is a litigating lawyer in Delhi and specialises in the field of criminal law, digital rights, technology, and privacy. She has been involved in litigation challenging the constitutionality of the Aadhaar Act, internet shutdowns, the surveillance framework in India and has argued multiple cases under POCSO. Vrinda has also worked with UN Women on the problems of technology facilitated gender-based violence and cyber-security."
    },
    {
        "name":  "Yannick Ragonneau",
        "designation":  "Technical Expert, Expertise France",
        "category":  "International",
        "photo":  "Yannick Ragonneau.png",
        "bio":  "Yannick Ragonneau is the Cybersecurity Thematic Coordinator for the EU-funded ESIWA+ project, enhancing the European Union’s cooperation with Asia and the Indo-Pacific on security and defence. With more than 30 years of experience, he has advised governments, international organisations, and the private sector. He is actively engaged in fostering international cooperation and multi-stakeholder dialogue to counter cyber threats, notably online fraud and scams."
    },
    {
        "name":  "Yoel Roth",
        "designation":  "Senior Vice President, Head of Trust \u0026 Safety, Match Group",
        "category":  "Technology",
        "photo":  "Yoel Roth.jpg",
        "bio":  "Yoel Roth is a trust and safety practitioner and researcher. He is the Senior Vice President of Trust \u0026 Safety at Match Group, the parent company of Tinder, Hinge, and more than a dozen other dating apps used by millions of people worldwide. He is also a Non-Resident Scholar at the Carnegie Endowment for International Peace, and was previously the Head of Trust \u0026 Safety at Twitter. His research, teaching, and writing focus on trustworthy governance approaches for social media, AI, and other emerging technologies."
    },
    {
        "name":  "Zoya Ali",
        "designation":  "Reproductive health scientist and sexuality educator",
        "category":  "Academia \u0026 Media",
        "photo":  "Zoya Ali.jpg",
        "bio":  "Zoya Ali is a reproductive scientist and sexual health educator, and the founder of Uteropedia, a digital-first platform making reproductive health accessible, stigma-free, and rooted in science. As a senior scientific research associate at Hertility Health, she works at the intersection of reproductive health, fertility and AI driven diagnostics, helping reduce time to diagnosis and turn science into real world solutions. With a growing global audience of 100,000+, Zoya translates complex research into relatable, medically accurate content, challenging taboos and misinformation around sexual and reproductive health and rights (SRHR).She has pursued an MSc in Prenatal Genetics \u0026 Fetal Medicine at University College London (UCL). She has been a past Editor for (European Society of Human Reproduction and Embryology) ESHRE’s Journal Club where she helped bring cutting-edge reproductive research to the forefront, ensuring it reaches the clinicians, scientists, and policymakers who can turn evidence into action."
    }
];
