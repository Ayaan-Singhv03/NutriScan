const { ConsumptionLog, User, FoodItem } = require('../models/relations');
const { Op } = require('sequelize');

// Helper function to calculate nutrition values based on amount consumed
const calculateNutritionFromAmount = (foodItem, amountConsumed) => {
  const ratio = amountConsumed / 100; // Convert from per 100g to consumed amount
  
  return {
    caloriesConsumed: Math.round((foodItem.caloriesPer100g * ratio) * 10) / 10,
    carbsConsumed: Math.round((foodItem.carbsPer100g * ratio) * 10) / 10,
    proteinsConsumed: Math.round((foodItem.proteinsPer100g * ratio) * 10) / 10,
    fatsConsumed: Math.round((foodItem.fatsPer100g * ratio) * 10) / 10,
    sugarsConsumed: Math.round((foodItem.sugarsPer100g * ratio) * 10) / 10
  };
};

const consumptionLogController = {
  // POST /api/logs - Create consumption log (with auto-calculation)
  createConsumptionLog: async (req, res) => {
    try {
      const { 
        barcode, 
        date = new Date().toISOString().split('T')[0], // Default to today
        amountConsumed,
        // Optional manual overrides (if user wants to specify custom values)
        caloriesConsumed, 
        carbsConsumed, 
        proteinsConsumed, 
        fatsConsumed, 
        sugarsConsumed,
        autoCalculate = true
      } = req.body;

      const user = await User.findOne({ 
        where: { firebase_uid: req.user.uid } 
      });

      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      // Verify food item exists
      const foodItem = await FoodItem.findOne({ 
        where: { barcode } 
      });

      if (!foodItem) {
        return res.status(404).json({ 
          error: 'Food item not found. Please add the food item first.' 
        });
      }

      // Validate amount consumed
      if (!amountConsumed || amountConsumed <= 0) {
        return res.status(400).json({ 
          error: 'Amount consumed must be a positive number (in grams)' 
        });
      }

      let nutritionValues;

      if (autoCalculate) {
        // Auto-calculate nutrition values based on food item data and amount
        nutritionValues = calculateNutritionFromAmount(foodItem, amountConsumed);
      } else {
        // Use provided values or calculate if not provided
        nutritionValues = {
          caloriesConsumed: caloriesConsumed !== undefined ? caloriesConsumed : calculateNutritionFromAmount(foodItem, amountConsumed).caloriesConsumed,
          carbsConsumed: carbsConsumed !== undefined ? carbsConsumed : calculateNutritionFromAmount(foodItem, amountConsumed).carbsConsumed,
          proteinsConsumed: proteinsConsumed !== undefined ? proteinsConsumed : calculateNutritionFromAmount(foodItem, amountConsumed).proteinsConsumed,
          fatsConsumed: fatsConsumed !== undefined ? fatsConsumed : calculateNutritionFromAmount(foodItem, amountConsumed).fatsConsumed,
          sugarsConsumed: sugarsConsumed !== undefined ? sugarsConsumed : calculateNutritionFromAmount(foodItem, amountConsumed).sugarsConsumed
        };
      }

      // Create consumption log
      const consumptionLog = await ConsumptionLog.create({
        userId: user.id,
        barcode,
        date,
        amountConsumed,
        ...nutritionValues
      });

      // Include food item details in response
      const logWithFood = await ConsumptionLog.findByPk(consumptionLog.id, {
        include: [{
          model: FoodItem,
          attributes: ['barcode', 'name', 'servingSize', 'caloriesPer100g', 'carbsPer100g', 'proteinsPer100g', 'fatsPer100g', 'sugarsPer100g']
        }]
      });

      res.status(201).json({
        message: 'Food consumption logged successfully',
        consumptionLog: logWithFood,
        calculationMethod: autoCalculate ? 'auto-calculated' : 'manual/mixed'
      });

    } catch (error) {
      console.error('Create consumption log error:', error);
      res.status(500).json({ 
        error: 'Failed to log food consumption' 
      });
    }
  },

  // GET /api/logs/:id - Get consumption log by ID
  getConsumptionLogById: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findOne({ 
        where: { firebase_uid: req.user.uid } 
      });

      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      const consumptionLog = await ConsumptionLog.findOne({
        where: { 
          id,
          userId: user.id // Ensure user can only access their own logs
        },
        include: [{
          model: FoodItem,
          attributes: ['barcode', 'name', 'servingSize', 'caloriesPer100g', 'carbsPer100g', 'proteinsPer100g', 'fatsPer100g', 'sugarsPer100g']
        }]
      });

      if (!consumptionLog) {
        return res.status(404).json({ 
          error: 'Consumption log not found' 
        });
      }

      res.status(200).json({ consumptionLog });

    } catch (error) {
      console.error('Get consumption log error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch consumption log' 
      });
    }
  },

  // GET /api/logs - Get user's consumption logs with filtering
  getAllConsumptionLogs: async (req, res) => {
    try {
      const { date, startDate, endDate, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const user = await User.findOne({ 
        where: { firebase_uid: req.user.uid } 
      });

      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      let whereClause = { userId: user.id };

      // Filter by specific date
      if (date) {
        whereClause.date = date;
      }
      // Filter by date range
      else if (startDate && endDate) {
        whereClause.date = {
          [Op.between]: [startDate, endDate]
        };
      }
      // Filter by start date only
      else if (startDate) {
        whereClause.date = {
          [Op.gte]: startDate
        };
      }
      // Filter by end date only
      else if (endDate) {
        whereClause.date = {
          [Op.lte]: endDate
        };
      }

      const { count, rows: consumptionLogs } = await ConsumptionLog.findAndCountAll({
        where: whereClause,
        include: [{
          model: FoodItem,
          attributes: ['barcode', 'name', 'servingSize']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['date', 'DESC'], ['createdAt', 'DESC']]
      });

      res.status(200).json({
        consumptionLogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Get consumption logs error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch consumption logs' 
      });
    }
  },

  // GET /api/logs/daily-summary/:date - Get daily nutrition summary with goal comparison
  getDailySummary: async (req, res) => {
    try {
      const { date } = req.params;

      const user = await User.findOne({ 
        where: { firebase_uid: req.user.uid } 
      });

      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      const logs = await ConsumptionLog.findAll({
        where: { 
          userId: user.id,
          date: date
        },
        include: [{
          model: FoodItem,
          attributes: ['name', 'servingSize']
        }]
      });

      // Calculate totals
      const summary = logs.reduce((totals, log) => ({
        totalCalories: Math.round((totals.totalCalories + log.caloriesConsumed) * 10) / 10,
        totalCarbs: Math.round((totals.totalCarbs + log.carbsConsumed) * 10) / 10,
        totalProteins: Math.round((totals.totalProteins + log.proteinsConsumed) * 10) / 10,
        totalFats: Math.round((totals.totalFats + log.fatsConsumed) * 10) / 10,
        totalSugars: Math.round((totals.totalSugars + log.sugarsConsumed) * 10) / 10,
        totalItems: totals.totalItems + 1
      }), {
        totalCalories: 0,
        totalCarbs: 0,
        totalProteins: 0,
        totalFats: 0,
        totalSugars: 0,
        totalItems: 0
      });

      // Try to get user's daily goals for comparison
      const { DailyGoal } = require('../models/relations');
      const dailyGoal = await DailyGoal.findOne({ 
        where: { userId: user.id } 
      });

      let goalComparison = null;
      if (dailyGoal) {
        goalComparison = {
          calories: {
            consumed: summary.totalCalories,
            goal: dailyGoal.calories,
            remaining: Math.max(0, dailyGoal.calories - summary.totalCalories),
            percentage: Math.round((summary.totalCalories / dailyGoal.calories) * 100)
          },
          carbs: {
            consumed: summary.totalCarbs,
            goal: dailyGoal.carbs,
            remaining: Math.max(0, dailyGoal.carbs - summary.totalCarbs),
            percentage: Math.round((summary.totalCarbs / dailyGoal.carbs) * 100)
          },
          proteins: {
            consumed: summary.totalProteins,
            goal: dailyGoal.proteins,
            remaining: Math.max(0, dailyGoal.proteins - summary.totalProteins),
            percentage: Math.round((summary.totalProteins / dailyGoal.proteins) * 100)
          },
          fats: {
            consumed: summary.totalFats,
            goal: dailyGoal.fats,
            remaining: Math.max(0, dailyGoal.fats - summary.totalFats),
            percentage: Math.round((summary.totalFats / dailyGoal.fats) * 100)
          },
          sugars: {
            consumed: summary.totalSugars,
            goal: dailyGoal.sugars,
            remaining: Math.max(0, dailyGoal.sugars - summary.totalSugars),
            percentage: Math.round((summary.totalSugars / dailyGoal.sugars) * 100)
          }
        };
      }

      res.status(200).json({
        date,
        summary,
        goalComparison,
        logs: logs.map(log => ({
          id: log.id,
          foodName: log.FoodItem.name,
          amountConsumed: log.amountConsumed,
          caloriesConsumed: log.caloriesConsumed,
          carbsConsumed: log.carbsConsumed,
          proteinsConsumed: log.proteinsConsumed,
          fatsConsumed: log.fatsConsumed,
          sugarsConsumed: log.sugarsConsumed,
          createdAt: log.createdAt
        }))
      });

    } catch (error) {
      console.error('Get daily summary error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch daily summary' 
      });
    }
  },

  // PUT /api/logs/:id - Update consumption log (with auto-recalculation)
  updateConsumptionLog: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        date, 
        amountConsumed,
        // Optional manual nutrition values
        caloriesConsumed, 
        carbsConsumed, 
        proteinsConsumed, 
        fatsConsumed, 
        sugarsConsumed,
        autoCalculate = true
      } = req.body;

      const user = await User.findOne({ 
        where: { firebase_uid: req.user.uid } 
      });

      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      const consumptionLog = await ConsumptionLog.findOne({
        where: { 
          id,
          userId: user.id
        },
        include: [{
          model: FoodItem
        }]
      });

      if (!consumptionLog) {
        return res.status(404).json({ 
          error: 'Consumption log not found' 
        });
      }

      let updateData = {
        date: date !== undefined ? date : consumptionLog.date
      };

      // If amount changed and auto-calculate is enabled, recalculate nutrition
      if (amountConsumed !== undefined) {
        updateData.amountConsumed = amountConsumed;
        
        if (autoCalculate) {
          const nutritionValues = calculateNutritionFromAmount(consumptionLog.FoodItem, amountConsumed);
          Object.assign(updateData, nutritionValues);
        }
      }

      // Allow manual overrides if auto-calculate is false
      if (!autoCalculate) {
        if (caloriesConsumed !== undefined) updateData.caloriesConsumed = caloriesConsumed;
        if (carbsConsumed !== undefined) updateData.carbsConsumed = carbsConsumed;
        if (proteinsConsumed !== undefined) updateData.proteinsConsumed = proteinsConsumed;
        if (fatsConsumed !== undefined) updateData.fatsConsumed = fatsConsumed;
        if (sugarsConsumed !== undefined) updateData.sugarsConsumed = sugarsConsumed;
      }

      // Update consumption log
      await consumptionLog.update(updateData);

      // Include food item details in response
      const updatedLog = await ConsumptionLog.findByPk(id, {
        include: [{
          model: FoodItem,
          attributes: ['barcode', 'name', 'servingSize']
        }]
      });

      res.status(200).json({
        message: 'Consumption log updated successfully',
        consumptionLog: updatedLog,
        calculationMethod: autoCalculate ? 'auto-calculated' : 'manual'
      });

    } catch (error) {
      console.error('Update consumption log error:', error);
      res.status(500).json({ 
        error: 'Failed to update consumption log' 
      });
    }
  },

  // DELETE /api/logs/:id - Delete consumption log
  deleteConsumptionLog: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findOne({ 
        where: { firebase_uid: req.user.uid } 
      });

      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      const consumptionLog = await ConsumptionLog.findOne({
        where: { 
          id,
          userId: user.id
        }
      });

      if (!consumptionLog) {
        return res.status(404).json({ 
          error: 'Consumption log not found' 
        });
      }

      await consumptionLog.destroy();

      res.status(200).json({
        message: 'Consumption log deleted successfully'
      });

    } catch (error) {
      console.error('Delete consumption log error:', error);
      res.status(500).json({ 
        error: 'Failed to delete consumption log' 
      });
    }
  }
};

module.exports = consumptionLogController; 