import { forwardRef, useRef } from "react";

const FeatureCard = forwardRef(
  (
    {
      title = "",
      description = "",
      icon = "",
      bgColor = "",
      borderColor = "#e5e7eb",
      borderWidth = 1,
      radius = {
        topLeft: 180,
        topRight: 0,
        bottomRight: 180,
        bottomLeft: 180,
      },
    },
    ref
  ) => {
    const cardInnerRef = useRef(null);

    function handleMouseMove(e) {
      if (!cardInnerRef.current) return;

      const rect = cardInnerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      cardInnerRef.current.style.setProperty("--mouse-x", `${x}px`);
      cardInnerRef.current.style.setProperty("--mouse-y", `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      cardInnerRef.current.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-4px)
      `;
    }

    function handleMouseLeave() {
      if (!cardInnerRef.current) return;
      cardInnerRef.current.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
    }

    const shapeRadius = `${radius.topLeft}px ${radius.topRight}px ${radius.bottomRight}px ${radius.bottomLeft}px`;

    const isHex = borderColor.startsWith("#");
    const shadowColor = isHex ? `${borderColor}4D` : "rgba(148, 201, 255, 0.4)";

    return (
      <div
        ref={ref}
        className="feature-card-outer relative h-full group/outer cursor-pointer w-full"
        style={{ perspective: "1000px" }}
      >
        <div
          ref={cardInnerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="flex w-full min-h-full flex-row items-center justify-start p-6 max-sm:p-4 rounded-2xl border transition-transform duration-200 hover:-translate-y-1 gap-5 max-sm:gap-3 bg-white"
          style={{
            border: `${borderWidth}px solid ${borderColor}`,
            borderRadius: shapeRadius,
            boxShadow: `inset 0 2px 18px -3px ${shadowColor}`,
          }}
        >
          <span
            className={`relative flex h-16 w-16 max-sm:h-12 max-sm:w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-sm p-2.5 [&_img]:!w-10 [&_img]:!h-10 [&_img]:!max-w-full [&_img]:!max-h-full [&_img]:!object-contain max-sm:[&_img]:!w-8 max-sm:[&_img]:!h-8 ${
              bgColor || "bg-slate-50"
            }`}
          >
            <img src={icon} alt="" />
          </span>

          <div className="text-right flex-1 min-w-0">
            <h3 className="text-[17px] max-sm:text-sm font-bold text-[#0F2A4A] leading-tight mb-1.5">
              {title}
            </h3>
            <p className="text-sm max-sm:text-[11px] leading-6 max-sm:leading-4 text-[#6B7A90]">
              {description}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

FeatureCard.displayName = "FeatureCard";

export default FeatureCard;
