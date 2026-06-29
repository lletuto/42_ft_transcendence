import Header from './Header';
import Sidebar from './Sidebar';

// Dans ton fichier JeuLayout.jsx
export default function JeuLayout({ children }) {
    return (
        <>
            {/* Arrière-plan dégradé général */}
            <div className="fixed inset-0 -z-10"
                style={{ background: 'linear-gradient(to bottom right, rgba(240, 86, 58, 1) 0%, rgba(240, 86, 58, 1) 15%, rgba(255, 157, 177, 1) 50%)' }}
            />

            <div className="flex h-screen w-screen overflow-hidden relative">
                <Sidebar style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(5px)',
                    width: 'clamp(200px, 15vw, 260px)'
                }} />

                {/* MODIFICATION 1 : On réduit le padding (p-1 ou p-2 max) et le gap pour donner plus de place au jeu */}
                <div className="flex-1 flex flex-col h-full overflow-hidden p-1 sm:p-2 gap-1.5 bg-transparent">
                    <Header style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(5px)',
                    }} />

                    {/* MODIFICATION 2 : flex-1 + h-full + w-full force la div à dévorer TOUT l'espace disponible restant */}
                    <div className="flex-1 h-full w-full bg-transparent min-h-0 relative">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}