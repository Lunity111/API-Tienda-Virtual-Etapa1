const app = Vue.createApp({
    data() {
        return {
            countries: [], // Lista de países
            selectedCountry: 'Mexican', // País seleccionado inicialmente
            meals: [], // Lista completa de platillos
            searchQuery: '', // Barra de búsqueda
            selectedRating: 1 // Calificación mínima seleccionada
        };
    },
    mounted() {
        this.loadCountries(); // Cargar países al iniciar
        this.loadMealsByCountry(); // Cargar platillos de México al iniciar
    },
    computed: {
        // Filtrar platillos según la búsqueda y calificación
        filteredMeals() {
            const query = this.searchQuery.toLowerCase(); // Convertir a minúsculas
            return this.meals.filter(meal =>
                meal.strMeal.toLowerCase().includes(query) && meal.rating >= this.selectedRating
            );
        },
        // Calcular el porcentaje de progreso
        progressPercentage() {
            return (this.filteredMeals.length / this.meals.length) * 100 || 0;
        }
    },
    methods: {
        // Cargar países
        loadCountries() {
            axios.get('https://www.themealdb.com/api/json/v1/1/list.php?a=list')
                .then(response => {
                    this.countries = response.data.meals;
                })
                .catch(error => {
                    console.error("Error al cargar países:", error);
                });
        },
        // Cargar platillos típicos del país seleccionado con detalles adicionales
        loadMealsByCountry() {
            if (this.selectedCountry) {
                axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${this.selectedCountry}`)
                    .then(response => {
                        const basicMeals = response.data.meals;

                        // Detallar cada platillo con más datos
                        const detailedMealsPromises = basicMeals.map(meal =>
                            axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
                                .then(res => {
                                    const mealDetails = res.data.meals[0];
                                    mealDetails.price = this.generateRandomPrice(); // Asignar precio aleatorio
                                    mealDetails.rating = this.generateRandomRating(); // Asignar calificación aleatoria
                                    return mealDetails;
                                })
                        );

                        // Procesar todas las promesas y actualizar el estado
                        Promise.all(detailedMealsPromises).then(detailedMeals => {
                            this.meals = detailedMeals;
                        });
                    })
                    .catch(error => {
                        console.error("Error al cargar platillos:", error);
                    });
            }
        },
        // Generar un precio aleatorio entre $100 y $500
        generateRandomPrice() {
            return Math.floor(Math.random() * 491) + 100; // $100 a $500
        },
        // Generar una calificación aleatoria entre 1 y 5
        generateRandomRating() {
            return Math.floor(Math.random() * 5) + 1; // 1 a 5 estrellas
        },
        // Generar HTML para las estrellas
        generateStars(rating) {
            return '★'.repeat(rating) + '☆'.repeat(5 - rating); // Rellenar estrellas
        }
    }
});

app.mount("#contenedor");



