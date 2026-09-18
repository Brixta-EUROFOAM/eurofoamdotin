"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  Mattress,
} from "@/lib/catalog";


function clamp(value: number) {
  return Math.max(
    0,
    Math.min(1, value)
  );
}


export default function AnimatedGallery({
  products,
}: {
  products: Mattress[];
}) {

  const sectionRef =
    useRef<HTMLElement>(null);

  const windowRef =
    useRef<HTMLDivElement>(null);

  const trackRef =
    useRef<HTMLDivElement>(null);

  const manualUntil =
    useRef(0);

  const [progress, setProgress] =
    useState(0);

  const [travelPx, setTravelPx] =
    useState(0);

  const [active, setActive] =
    useState(0);


  const images = [
    products[0]?.image,
    null,
    products[1]?.image,
    null,
    products[2]?.image,
  ];


  const rooms = [
    {
      number: "01",
      eyebrow: "BEDROOM / HOME",
      title: "Actual bedroom.",
      note: "Where the gadda actually lives.",
      image: images[0],
    },

    {
      number: "02",
      eyebrow: "CAMPAIGN / ART",
      title: "Thoda drama.",
      note: "Designer artwork goes here.",
      image: images[1],
    },

    {
      number: "03",
      eyebrow: "DETAIL / CLOSE-UP",
      title: "Gadda, up close.",
      note: "Texture. Fabric. Construction.",
      image: images[2],
    },

    {
      number: "04",
      eyebrow: "CAMPAIGN / ART",
      title: "Not a showroom.",
      note: "Make this weird.",
      image: images[3],
    },

    {
      number: "05",
      eyebrow: "COLLECTION / HOME",
      title: "Bas bedroom.",
      note: "No salesman standing next to it.",
      image: images[4],
    },
  ];


  useEffect(() => {

    let raf = 0;

    const update = () => {

      raf = 0;

      const section =
        sectionRef.current;

      if (!section) return;

      const rect =
        section.getBoundingClientRect();

      const vh =
        window.innerHeight || 1;

      const travel =
        Math.max(
          1,
          rect.height - vh
        );

      const raw =
        clamp(
          -rect.top / travel
        );

      setProgress(raw);


      /*
        Calculate the actual horizontal distance
        from rendered geometry.

        No percentage-of-the-whole-track nonsense.
      */

      const viewport =
        windowRef.current;

      const track =
        trackRef.current;

      if (viewport && track) {

        const viewportWidth =
          viewport.clientWidth;

        const trackWidth =
          track.scrollWidth;

        const rightBreathingRoom =
          Math.min(
            80,
            viewportWidth * 0.06
          );

        const maxTravel =
          Math.max(
            0,
            trackWidth
              - viewportWidth
              + rightBreathingRoom
          );

        setTravelPx(
          raw * maxTravel
        );

      }


      if (
        Date.now() >
        manualUntil.current
      ) {

        const index =
          Math.min(
            rooms.length - 1,
            Math.round(
              raw *
              (rooms.length - 1)
            )
          );

        setActive(index);

      }

    };


    const request = () => {

      if (!raf) {

        raf =
          requestAnimationFrame(
            update
          );

      }

    };


    update();

    window.addEventListener(
      "scroll",
      request,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      request
    );


    return () => {

      window.removeEventListener(
        "scroll",
        request
      );

      window.removeEventListener(
        "resize",
        request
      );

      if (raf) {
        cancelAnimationFrame(raf);
      }

    };

  }, []);


  function choose(index: number) {

    manualUntil.current =
      Date.now() + 1600;

    setActive(index);

  }



  return (

    <section
      ref={sectionRef}
      id="gallery"
      className="gadda-room-tour"
    >

      <div className="gadda-room-sticky">


        {/* ======================================
            LEFT TITLE PANEL
        ======================================= */}

        <div className="gadda-room-copy">

          <p className="gadda-room-label">
            04 / IN THE WILD
          </p>


          <h2>
            BEDROOMS,
            <br />
            NOT
            <br />
            SHOWROOMS.
          </h2>


          <p className="gadda-room-intro">
            Gadde belong in rooms.
            <br />
            Not under tube lights.
          </p>


          <div className="gadda-room-progress">

            <span>
              SCROLL THE ROOMS
            </span>

            <div>

              <i
                style={{
                  transform:
                    `scaleX(${progress})`
                }}
              />

            </div>

          </div>

        </div>



        {/* ======================================
            HORIZONTAL MOVING CONTACT SHEET
        ======================================= */}

        <div
          ref={windowRef}
          className="gadda-room-window"
        >

          <div
            ref={trackRef}
            className="gadda-room-track"

            style={{
              transform:
                `translate3d(-${travelPx}px, -50%, 0)`,
            }}
          >

            {rooms.map(
              (room, index) => {

                const isActive =
                  active === index;

                return (

                  <button
                    key={room.number}
                    type="button"

                    onClick={() =>
                      choose(index)
                    }

                    className={
                      "gadda-room-card " +
                      (
                        isActive
                          ? "is-active"
                          : ""
                      )
                    }
                  >


                    <div className="gadda-room-card-top">

                      <span>
                        ROOM {room.number}
                      </span>

                      <span>
                        GADDA
                      </span>

                    </div>


                    <div className="gadda-room-media">

                      {room.image ? (

                        <img
                          src={room.image}
                          alt={room.title}
                          draggable={false}
                        />

                      ) : (

                        <div className="gadda-room-placeholder">

                          <strong>
                            DESIGNER
                            <br />
                            ARTWORK
                          </strong>

                          <span>
                            CAMPAIGN /
                            COLLAGE /
                            BEDROOM
                          </span>

                        </div>

                      )}


                      <div className="gadda-room-sticker">
                        {room.number}
                      </div>

                    </div>


                    <div className="gadda-room-card-copy">

                      <p>
                        {room.eyebrow}
                      </p>

                      <h3>
                        {room.title}
                      </h3>

                      <span>
                        {room.note}
                      </span>

                    </div>


                  </button>

                );

              }
            )}

          </div>

        </div>



        {/* ======================================
            ACTIVE ROOM INDEX
        ======================================= */}

        <div className="gadda-room-index">

          <span>
            CURRENT ROOM
          </span>

          <strong>
            {rooms[active].number}
          </strong>

        </div>


      </div>

    </section>

  );

}
