import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";
import Stripe from "stripe";

export const getCheckoutSession = async (req, res) => {
  try {
    // Get currently booked doctor
    const doctor = await Doctor.findById(req.params.doctorId);
    const user = await User.findById(req.userId);

    if (!doctor || !user) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor or user not found" });
    }

    // Validate and convert ticket price
    const ticketPrice = parseFloat(doctor.ticketPrice);
    if (isNaN(ticketPrice) || ticketPrice <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ticket price" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_SITE_URL}/checkout-success`,
      cancel_url: `${req.protocol}://${req.get("host")}/doctors/${doctor.id}`,
      customer_email: user.email,
      client_reference_id: req.params.doctorId,
      line_items: [
        {
          price_data: {
            currency: "bdt",
            unit_amount: Math.round(ticketPrice * 100), // Ensure unit_amount is an integer
            product_data: {
              name: doctor.name,
              description: doctor.bio,
              images: [doctor.photo],
            },
          },
          quantity: 1,
        },
      ],
    });

    // Create new booking
    const booking = new Booking({
      doctor: doctor._id,
      user: user._id,
      ticketPrice: doctor.ticketPrice,
      session: session.id,
    });

    console.log(`Success URL: ${process.env.CLIENT_SITE_URL}/checkout-success`);

    await booking.save();
    res
      .status(200)
      .json({ success: true, message: "Successfully paid", session });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res
      .status(500)
      .json({ success: false, message: "Error creating checkout session" });
  }
};
