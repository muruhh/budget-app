var view = (function(){
    // This is the View Module which handles the app UI

    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    document.querySelector(".budget__title--month").textContent = months[new Date().getMonth()];

    var clear_inputs = function(){
        document.querySelector(".add__description").value = '';
        document.querySelector(".add__value").value = '';
    }

    return{
        get_inputs: function(){
            return {
                type: document.querySelector(".add__type").value,
                description: document.querySelector(".add__description").value,
                value: document.querySelector(".add__value").value
            }
        },
        
        display_item: function(item){
            var type = item.constructor.name;
            var id = item.id;
            var description = item.description;
            var value = item.value;
            var element = '.' + type + '__list';

            var sign = '+ ';
            var itemHTML = '<div class="item clearfix" id="income-' + id + '"><div class="item__description">' + description + '</div><div class="right clearfix"><div class="item__value">' + sign + value + '</div><div class="item__delete"><button class="item__delete--btn" data-type="income" data-id="' + id + '"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            
            if(type == "Outcomes"){
                sign = '- ';
                itemHTML = '<div class="item clearfix" id="outcome-' + id + '"><div class="item__description">' + description + '</div><div class="right clearfix"><div class="item__value">' + sign + value + '</div><div class="item__delete"><button class="item__delete--btn" data-type="outcome" data-id="' + id + '"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }

            document.querySelector(element).insertAdjacentHTML('afterbegin', itemHTML);
            clear_inputs();
        },

        display_budget: function(budgets){
            document.querySelector(".budget__value").textContent = budgets.total > 0 ? '+' + budgets.total : budgets.total;
            document.querySelector(".budget__income--value").textContent = budgets.inc > 0 ? '+' + budgets.inc : budgets.inc;
            document.querySelector(".budget__expenses--value").textContent = budgets.exp > 0 ? '-' + budgets.exp : budgets.exp;
            document.querySelector(".budget__expenses--percentage").textContent = budgets.exp_percentage + "%";
        },

        change_colors: function(){
            document.querySelector(".add__btn").classList.toggle('red');
            document.querySelector(".add__type").classList.toggle('red');
            document.querySelector(".add__description").classList.toggle('red');
            document.querySelector(".add__value").classList.toggle('red');

            document.querySelector(".add__type").classList.toggle('red-focus');
            document.querySelector(".add__description").classList.toggle('red-focus');
            document.querySelector(".add__value").classList.toggle('red-focus');
        },

        remove_items: function(id, type){
            var element = document.getElementById(type + "-" + id);
            element.parentNode.removeChild(element);
        }
    }
})();



var controller = (function(){
    // This is the Controller Module which handles the app Logic and Data
    
    var Incomes = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    var Outcomes = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var items = {
        inc: [],
        exp: []
    }

    var budget = {
        inc: 0,
        exp: 0,
        total: 0,
        exp_percentage: 0
    }

    var addNewItem = function(inputs_values){
        // Generate Item ID
        var newID = items[inputs_values.type].length == 0 ? 0 : items[inputs_values.type].length;

        if(inputs_values.type == 'inc'){
            var item = new Incomes(newID, inputs_values.description, inputs_values.value);
        }
        else{
            var item = new Outcomes(newID, inputs_values.description, inputs_values.value);
        }

        // Insert new item to its budget array
        items[inputs_values.type][newID] = item;
        return item;
    }


    var calcBudget = function(){
        budget.inc = budget.exp = 0;

        items.inc.forEach(element => {
            budget.inc += parseFloat(element.value);
        });

        items.exp.forEach(element => {
            budget.exp += parseFloat(element.value);
        });
        
        budget.total = budget.inc - budget.exp;
        budget.exp_percentage = budget.inc > 0 ? parseFloat(Math.ceil( (budget.exp / budget.inc) * 100 )) : budget.exp > 0 ? 100 : 0;
        return budget;
    }

    
    var removeItem = function(ID, type){
        var item_type = 'inc';
        type == 'outcome' && (item_type = 'exp');

        var elements = items[item_type].map(function(el){
            return el.id;
        });

        var item_index = elements.indexOf(parseInt(ID));

        if(item_index !== -1){
            items[item_type].splice(item_index, 1);
        }
    }


    return{
        create_item: function(inputs){
            return addNewItem(inputs);
        },

        calculate_item: function(){
            return calcBudget();
        },

        remove_item: function(id, type){
            return removeItem(id, type);
        }
    }
})();



var app = (function(_view, _controller) {
    // This is the main App Module wich handles the View and the Controller modules
    
    document.querySelector(".add__btn").addEventListener("click", function(){
        // Getting inputs values
        var inputs = _view.get_inputs();

        if(inputs.description !== "" && inputs.value > 0){
            // Adding new item to the Controller Module
            var newItem = _controller.create_item(inputs);

            // Adding new item to the View Module
            _view.display_item(newItem);

            // Calculating item budget
            var budgets = _controller.calculate_item();

            // Displaying budgets to the View Module
            _view.display_budget(budgets);
        }
    });

    
    document.querySelector(".container").addEventListener("click", function(event){
        var el = event.target.parentNode.classList;
        var el_id = event.target.parentNode.dataset.id;
        var el_type = event.target.parentNode.dataset.type;
        
        if (el.contains('item__delete--btn')){
            _controller.remove_item(el_id, el_type);
            _view.remove_items(el_id, el_type);
            var budgets = _controller.calculate_item();

            // console.log(budgets);
            _view.display_budget(budgets);
        }
    });


    document.querySelector(".add__type").addEventListener("change", function(){
        _view.change_colors();
    });
})(view, controller);
