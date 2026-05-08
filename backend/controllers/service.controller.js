const Service = require('../models/Service.model');

exports.getAllServices = async (req, res) => {
  try {
    const { category, featured } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;

    let services = await Service.find(filter).sort({ isFeatured: -1, createdAt: -1 });
    
    if (services.length === 0) {
      try {
        await Service.deleteMany({});
        const newServices = await Service.insertMany([
            { name: 'Signature Haircut & Style', category: 'Hair', price: 1200, duration: 60, description: 'Premium haircut with styling', isActive: true, isFeatured: true },
            { name: 'Gold Facial', category: 'Skincare', price: 2800, duration: 75, description: 'Luxury 24k gold facial treatment', isActive: true, isFeatured: true },
            { name: 'Bridal Makeup', category: 'Bridal', price: 8000, duration: 180, description: 'Complete bridal makeup package', isActive: true, isFeatured: true },
            { name: 'Keratin Treatment', category: 'Hair', price: 4500, duration: 150, description: 'Advanced keratin smoothing treatment', isActive: true, isFeatured: true },
            { name: 'Swedish Massage', category: 'Massage', price: 2200, duration: 60, description: 'Relaxing 60-minute Swedish massage', isActive: true, isFeatured: true }
          ]);
        services = newServices;
      } catch (seedErr) {
        return res.status(500).json({ success: false, message: 'Seeding failed', error: seedErr.message });
      }
    }

    res.json({ success: true, services, debug: { len: services.length, filter } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service)
      return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service)
      return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
