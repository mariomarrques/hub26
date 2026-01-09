import bannerImage from "@/assets/css-logo-banner.png";

export const ImportBanner = () => {
  return (
    <div className="animate-fade-in">
      <img 
        src={bannerImage} 
        alt="Os produtos abaixo são importados diretamente da China" 
        className="w-full h-auto rounded-xl shadow-lg"
      />
    </div>
  );
};
