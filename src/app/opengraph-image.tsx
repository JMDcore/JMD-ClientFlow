import { ImageResponse } from "next/og"

export const alt = "JMD ClientFlow - CRM ligero para freelancers"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const stages = [
  ["Nuevo lead", "1", "1,9 mil €", "#5369a6", "26%"],
  ["Contactado", "2", "6,3 mil €", "#756ca1", "48%"],
  ["Reunión", "2", "7,6 mil €", "#c49532", "62%"],
  ["Propuesta", "2", "6,8 mil €", "#d26f55", "55%"],
  ["Negociación", "1", "5,4 mil €", "#9e5d7b", "36%"],
]

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#f5f6f7",
        color: "#171b19",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "360px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "54px 44px",
          background: "#171c1a",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <svg width="48" height="48" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#2d8a68" />
            <path
              d="M16 43c0-8 5-13 13-12 9 1 13-4 18-13"
              fill="none"
              stroke="#f4f7f5"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="43" r="5" fill="#f4f7f5" />
            <circle
              cx="30"
              cy="31"
              r="5"
              fill="#2d8a68"
              stroke="#f4f7f5"
              strokeWidth="3.5"
            />
            <circle
              cx="47"
              cy="18"
              r="6"
              fill="#e4b65b"
              stroke="#236f55"
              strokeWidth="2"
            />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "25px", fontWeight: 700 }}>
              ClientFlow
            </span>
            <span
              style={{
                marginTop: "5px",
                fontSize: "11px",
                color: "#8f9c96",
                textTransform: "uppercase",
              }}
            >
              JMD · Client ops
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "92px",
          }}
        >
          <span
            style={{
              color: "#58bd98",
              fontSize: "13px",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            CRM para profesionales
          </span>
          <span
            style={{
              marginTop: "18px",
              fontSize: "42px",
              lineHeight: 1.08,
              fontWeight: 700,
            }}
          >
            Negocio claro. Próximo paso visible.
          </span>
          <span
            style={{
              marginTop: "22px",
              fontSize: "17px",
              lineHeight: 1.45,
              color: "#a8b2ad",
            }}
          >
            Clientes, oportunidades, tareas y seguimiento en un único espacio.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            marginTop: "auto",
            color: "#8f9c96",
            fontSize: "13px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#46aa84",
            }}
          />
          Diseñado por José Miguel Díaz
        </div>
      </div>

      <div
        style={{
          width: "840px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "48px 46px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "30px", fontWeight: 700 }}>
              Resumen comercial
            </span>
            <span
              style={{ marginTop: "7px", color: "#69736e", fontSize: "15px" }}
            >
              Rendimiento y actividad del pipeline
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              height: "34px",
              padding: "0 13px",
              border: "1px solid #e0e4e2",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#69736e",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#258963",
              }}
            />
            Demo activa
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
          {[
            ["Pipeline total", "28 mil €", "#e4f0eb", "#147a5b"],
            ["Previsión", "13,9 mil €", "#f4ecda", "#926b1d"],
            ["Clientes activos", "4", "#e8e5f1", "#665783"],
            ["Tasa de éxito", "67%", "#f2e5e0", "#a44f39"],
          ].map(([label, value, background, color]) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minHeight: "108px",
                padding: "17px",
                border: "1px solid #e0e4e2",
                borderRadius: "8px",
                background: "#ffffff",
              }}
            >
              <span
                style={{
                  alignSelf: "flex-start",
                  padding: "5px 7px",
                  borderRadius: "6px",
                  background,
                  color,
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {label}
              </span>
              <span
                style={{ marginTop: "13px", fontSize: "24px", fontWeight: 700 }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            marginTop: "16px",
            padding: "23px 25px",
            border: "1px solid #e0e4e2",
            borderRadius: "8px",
            background: "#ffffff",
            boxShadow: "0 14px 36px rgba(19,26,22,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: "18px", fontWeight: 700 }}>
              Estado del pipeline
            </span>
            <span
              style={{ marginLeft: "auto", color: "#69736e", fontSize: "13px" }}
            >
              8 oportunidades abiertas
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "17px",
            }}
          >
            {stages.map(([label, count, value, color, width]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "13px",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      marginRight: "10px",
                      borderRadius: "50%",
                      background: color,
                    }}
                  />
                  <span style={{ fontWeight: 600 }}>{label}</span>
                  <span style={{ marginLeft: "10px", color: "#909894" }}>
                    {count}
                  </span>
                  <span style={{ marginLeft: "auto", color: "#69736e" }}>
                    {value}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    height: "5px",
                    marginTop: "7px",
                    borderRadius: "4px",
                    background: "#edf0ee",
                  }}
                >
                  <span
                    style={{
                      width,
                      height: "5px",
                      borderRadius: "4px",
                      background: color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    size,
  )
}
