"use client";
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import InputBox from '@/components/InputBox'

const API = "/api/auth/register";

export default function Register() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		nickname: "",
	});
	const [error, setError] = useState({
		email: "",
		password: "",
		nickname: "",
	});
	const router = useRouter();


	const handleChange = (e) => {

		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};
	//asynchronous function. triggered by a form submission, 
	//async allows the use of await
	const handleSubmit = async (e) => {
		e.preventDefault(); // Prevents auto refresh at form submission 
		try {
			//sends a http request to the APIand awaits the response, only contains the metadata
			const response = await fetch(API, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(formData),
			});
			const text = await response.text();
			const data = text ? JSON.parse(text) : {};
			if (!response.ok) {
				const messages = Array.isArray(data.message)
					? data.message
					: [data.message || "Une erreur est survenue"];
				setError({ email: "", password: "", nickname: "" });
				messages.forEach(msg => {
					const m = msg.toLowerCase();
					if (m.includes("email")) {
						setError(prev => ({ ...prev, email: msg }));
					} else if (m.includes("nickname")) {
						setError(prev => ({ ...prev, nickname: msg }));
					} else if (m.includes("password")) {
						setError(prev => ({ ...prev, password: msg }));
					} else {
						setError(prev => ({ ...prev, email: msg })); // fallback
					}
				});
				return;
			}

			if (data.twoFactorRequired) {
				router.push('/2fa');
				return;
			}
			router.push("/login");
		}
		catch (error) {
			setError(prev => ({ ...prev, email: "Erreur réseau. Vérifie la console F12." }));
		}
	};

	return (
		<div className="flex flex-col items-center min-h-screen w-full overflow-y-auto py-12 justify-start sm:justify-center">
			<div style={{ width: 'var(--container-sm)' }} className="w-full px-sm">
				<form onSubmit={handleSubmit}
					method="POST"
					className="w-full flex flex-col gap-lg">
					<div className="flex flex-col gap-8 z-20" style={{ gap: 'var(--space-lg)' }}>
						<InputBox
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="Email"
							error={error.email}
						/>
						<InputBox
							type="text"
							name="nickname"
							value={formData.nickname}
							onChange={handleChange}
							placeholder="Username"
							error={error.nickname}
						/>
						<InputBox
							type="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							placeholder="Password"
							error={error.password}
						/>
						<button
							type="submit"
							className="btn_orange animate-float-3"
						>
							Register
						</button>
						<div className="flex gap-xs justify-center text-sm text-orange">
							Already have an account?
							<button
								type="button"
								onClick={() => router.push('/login')}
								className="underline hover:opacity-70">
								Log in here
							</button>
						</div>
					</div>
				</form>
			</div >
		</div >
	);
}

